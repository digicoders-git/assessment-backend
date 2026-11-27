import assignmentModel from "../Models/assignmentModel.js";
import assignmentLogModel from "../Models/assignmentLogModel.js";
import amdidnModel from "../Models/adminModel.js";
import collegeModel from "../Models/collegeModel.js";
import assessmentModel from "../Models/assesmentModel.js";
import studentModel from "../Models/studentModel.js";
import remarkModel from "../Models/remarkModel.js";

// 1. Get options with assignment status (Colleges & Assessments)
export const getAssignableItems = async (req, res) => {
  try {
    const colleges = await collegeModel.find().sort({ collegeName: 1 }).lean();
    const assessments = await assessmentModel.find().select("assessmentCode assessmentName assessmentType").sort({ createdAt: -1 }).lean();
    
    // Find all active assignments
    const activeAssignments = await assignmentModel.find({ status: "active" }).populate("assignedTo", "userName email userId").lean();
    
    const collegeMap = {};
    const assessmentMap = {};
    
    activeAssignments.forEach(a => {
      if (a.type === "college") {
        collegeMap[a.targetName] = a.assignedTo;
      } else if (a.type === "assessment") {
        assessmentMap[a.targetId] = a.assignedTo;
      }
    });

    const formattedColleges = colleges.map(c => ({
      _id: c._id,
      name: c.collegeName,
      isAssigned: !!collegeMap[c.collegeName],
      assignedTo: collegeMap[c.collegeName] || null
    }));

    const formattedAssessments = assessments.map(a => ({
      _id: a._id,
      code: a.assessmentCode,
      name: a.assessmentName,
      type: a.assessmentType,
      isAssigned: !!assessmentMap[a.assessmentCode],
      assignedTo: assessmentMap[a.assessmentCode] || null
    }));

    res.status(200).json({
      success: true,
      colleges: formattedColleges,
      assessments: formattedAssessments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Assign item (College or Assessment) to a user (handles reassign)
export const assignItem = async (req, res) => {
  try {
    const { userId, type, targetId, targetName } = req.body;
    const adminId = req.admin._id;

    if (!userId || !type || !targetId || !targetName) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const targetUser = await amdidnModel.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "Target user not found" });
    }

    // Check if currently assigned to someone
    const existing = await assignmentModel.findOne({
      type,
      targetId,
      status: "active"
    }).populate("assignedTo", "userName email userId");

    let action = "assigned";
    let fromUser = null;

    if (existing) {
      if (String(existing.assignedTo?._id) === String(userId)) {
        return res.status(400).json({
          success: false,
          message: `Already assigned to ${existing.assignedTo.userName}`
        });
      }

      // Reassign: Mark old active as reassigned
      action = "reassigned";
      fromUser = existing.assignedTo?._id;
      existing.status = "reassigned";
      await existing.save();
    }

    // Create new active assignment
    const newAssignment = await assignmentModel.create({
      assignedTo: userId,
      type,
      targetId,
      targetName,
      assignedBy: adminId,
      status: "active"
    });

    // Create audit log
    await assignmentLogModel.create({
      type,
      targetId,
      targetName,
      action,
      fromUser,
      toUser: userId,
      performedBy: adminId
    });

    res.status(201).json({
      success: true,
      message: action === "reassigned" 
        ? `Successfully reassigned ${targetName} to ${targetUser.userName}`
        : `Successfully assigned ${targetName} to ${targetUser.userName}`,
      assignment: newAssignment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Revoke assignment
export const revokeAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin._id;

    const assignment = await assignmentModel.findById(id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    assignment.status = "revoked";
    await assignment.save();

    await assignmentLogModel.create({
      type: assignment.type,
      targetId: assignment.targetId,
      targetName: assignment.targetName,
      action: "revoked",
      fromUser: assignment.assignedTo,
      toUser: assignment.assignedTo,
      performedBy: adminId
    });

    res.status(200).json({ success: true, message: "Assignment revoked successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Get active assignments by user
export const getUserAssignments = async (req, res) => {
  try {
    const { userId } = req.params;
    const assignments = await assignmentModel.find({
      assignedTo: userId,
      status: "active"
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Get full assignment tracking summary and logs
export const getAssignmentTracking = async (req, res) => {
  try {
    const users = await amdidnModel.find({ role: "user" }).select("userName email userId isActive").lean();
    const activeAssignments = await assignmentModel.find({ status: "active" }).lean();
    const logs = await assignmentLogModel.find()
      .populate("fromUser", "userName email userId")
      .populate("toUser", "userName email userId")
      .populate("performedBy", "userName")
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    // Map summary per user
    const userSummary = users.map(u => {
      const userActive = activeAssignments.filter(a => String(a.assignedTo) === String(u._id));
      const colleges = userActive.filter(a => a.type === "college");
      const assessments = userActive.filter(a => a.type === "assessment");
      const reassignCount = logs.filter(l => l.action === "reassigned" && (String(l.toUser?._id) === String(u._id) || String(l.fromUser?._id) === String(u._id))).length;

      return {
        ...u,
        assignedCollegesCount: colleges.length,
        assignedColleges: colleges.map(c => c.targetName),
        assignedAssessmentsCount: assessments.length,
        assignedAssessments: assessments.map(a => ({ code: a.targetId, name: a.targetName })),
        reassignCount
      };
    });

    res.status(200).json({
      success: true,
      summary: userSummary,
      logs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Get Telecaller Stat Cards (for logged in user or admin)
export const getTelecallerStats = async (req, res) => {
  try {
    const admin = req.admin;
    const isSuperAdmin = admin.role === "admin";

    let matchConditions = {};

    if (!isSuperAdmin) {
      // Find active assignments for this user
      const userAssignments = await assignmentModel.find({
        assignedTo: admin._id,
        status: "active"
      });

      const assignedColleges = userAssignments.filter(a => a.type === "college").map(a => a.targetName);
      const assignedCodes = userAssignments.filter(a => a.type === "assessment").map(a => a.targetId);

      // If user has no assignments, return 0 stats
      if (assignedColleges.length === 0 && assignedCodes.length === 0) {
        return res.status(200).json({
          success: true,
          stats: {
            totalLeads: 0,
            connectedCalls: 0,
            pendingCalls: 0,
            todayCalls: 0,
            statusCounts: {}
          }
        });
      }

      matchConditions.$or = [];
      if (assignedColleges.length > 0) {
        matchConditions.$or.push({ college: { $in: assignedColleges } });
      }
      if (assignedCodes.length > 0) {
        matchConditions.$or.push({ code: { $in: assignedCodes } });
      }
    }

    const totalLeads = await studentModel.countDocuments(matchConditions);

    // Group remarks by student
    const studentDocs = await studentModel.find(matchConditions).select("_id").lean();
    const studentIds = studentDocs.map(s => s._id);

    const remarks = await remarkModel.find({ student: { $in: studentIds } }).sort({ createdAt: -1 });

    // Calculate start of today (IST / UTC)
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const statusCounts = {};
    const contactedStudentIds = new Set();
    const todayContactedStudentIds = new Set();

    remarks.forEach(r => {
      contactedStudentIds.add(String(r.student));
      statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;

      // Count unique student leads contacted today
      if (r.createdAt && new Date(r.createdAt) >= startOfToday) {
        todayContactedStudentIds.add(String(r.student));
      }
    });

    const todayCalls = todayContactedStudentIds.size;
    const connectedCalls = contactedStudentIds.size;
    const pendingCalls = Math.max(0, totalLeads - connectedCalls);

    res.status(200).json({
      success: true,
      stats: {
        totalLeads,
        connectedCalls,
        pendingCalls,
        todayCalls,
        statusCounts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Get detailed Lead Report for a user with date range and filters
export const getUserLeadReport = async (req, res) => {
  try {
    const { userId, startDate, endDate, college, status, assessmentCode } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const user = await amdidnModel.findById(userId).select("userName email userId role").lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 1. Fetch all assignments (active and reassigned) for this user to know when & who assigned them
    const assignments = await assignmentModel.find({ assignedTo: userId })
      .populate("assignedBy", "userName email")
      .sort({ createdAt: -1 })
      .lean();

    const activeColleges = assignments.filter(a => a.type === "college" && a.status === "active").map(a => a.targetName);
    const activeAssessments = assignments.filter(a => a.type === "assessment" && a.status === "active").map(a => a.targetId);

    // All colleges & assessments ever assigned
    const allColleges = [...new Set(assignments.filter(a => a.type === "college").map(a => a.targetName))];
    const allAssessments = [...new Set(assignments.filter(a => a.type === "assessment").map(a => a.targetId))];

    // Assignment history details (who assigned, when, what status)
    const assignmentHistory = assignments.map(a => ({
      _id: a._id,
      type: a.type,
      targetId: a.targetId,
      targetName: a.targetName,
      status: a.status,
      assignedBy: a.assignedBy?.userName || "Admin",
      assignedAt: a.createdAt,
      updatedAt: a.updatedAt
    }));

    // Find distinct colleges linked to assigned assessments
    let assessmentLinkedColleges = [];
    if (allAssessments.length > 0) {
      try {
        assessmentLinkedColleges = await studentModel.distinct("college", { code: { $in: allAssessments } });
      } catch (e) {
        assessmentLinkedColleges = [];
      }
    }

    // Combine both direct assigned colleges and colleges linked to assigned assessments
    const rawUserColleges = [...new Set([...allColleges, ...assessmentLinkedColleges.filter(Boolean)])];

    // Deduplicate / normalize colleges (e.g. if 'SRMU Lucknow' and full name 'SHRI RAMSWAROOP MEMORIAL UNIVERSITY (SRMU)...' both exist, keep the full official name)
    const normalizedCollegesSet = new Set(rawUserColleges);
    const hasFullSRMU = rawUserColleges.some(c => c.toUpperCase().includes("SHRI RAMSWAROOP MEMORIAL UNIVERSITY"));
    if (hasFullSRMU) {
      normalizedCollegesSet.delete("SRMU Lucknow");
      normalizedCollegesSet.delete("SRMU");
    }
    const allUserColleges = Array.from(normalizedCollegesSet).sort();

    // If user has no assignments, return empty
    if (allColleges.length === 0 && allAssessments.length === 0) {
      return res.status(200).json({
        success: true,
        user,
        stats: {
          totalAssignedLeads: 0,
          callsDone: 0,
          pendingLeads: 0,
          todayCalls: 0,
          totalRemarks: 0,
          assignedCollegesCount: 0,
          assignedAssessmentsCount: 0,
          statusCounts: {}
        },
        userColleges: [],
        assignments: assignmentHistory,
        students: []
      });
    }

    // 2. Build Student Match Conditions
    const studentMatch = { $or: [] };
    if (allColleges.length > 0) studentMatch.$or.push({ college: { $in: allColleges } });
    if (allAssessments.length > 0) studentMatch.$or.push({ code: { $in: allAssessments } });

    // Optional query filters
    if (college && college !== "all") {
      studentMatch.college = { $regex: college.trim(), $options: "i" };
    }
    if (assessmentCode && assessmentCode !== "all") {
      studentMatch.code = assessmentCode;
    }

    // Fetch students
    let students = await studentModel.find(studentMatch)
      .select("name mobile email college course year code createdAt")
      .sort({ createdAt: -1 })
      .lean();

    // Deduplicate students by mobile (take latest registration)
    const uniqueStudentMap = new Map();
    students.forEach(s => {
      if (!uniqueStudentMap.has(s.mobile)) {
        uniqueStudentMap.set(s.mobile, s);
      }
    });
    const uniqueStudents = Array.from(uniqueStudentMap.values());
    const studentIds = uniqueStudents.map(s => s._id);

    // 3. Fetch Remarks made by this user or on these students
    const remarkQuery = { student: { $in: studentIds } };
    
    // Date filter on remarks or registrations if provided
    let startD = null;
    let endD = null;
    if (startDate) {
      startD = new Date(startDate);
      startD.setHours(0, 0, 0, 0);
    }
    if (endDate) {
      endD = new Date(endDate);
      endD.setHours(23, 59, 59, 999);
    }

    const remarks = await remarkModel.find(remarkQuery)
      .populate("admin", "userName email")
      .sort({ createdAt: -1 })
      .lean();

    // Group remarks by student ID
    const remarksByStudent = {};
    let userRemarksCount = 0;
    const todayContactedStudentIds = new Set();
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    remarks.forEach(rem => {
      const sId = String(rem.student);
      if (!remarksByStudent[sId]) remarksByStudent[sId] = [];
      remarksByStudent[sId].push(rem);

      // Check if remark made by this user
      if (String(rem.admin?._id || rem.admin) === String(userId)) {
        userRemarksCount++;
        // Count unique student leads contacted today by this user
        if (rem.createdAt && new Date(rem.createdAt) >= startOfToday) {
          todayContactedStudentIds.add(sId);
        }
      }
    });

    const todayCalls = todayContactedStudentIds.size;

    // 4. Compute Student Status, Remarks Count, and apply Status / Date filters
    // Apply date range filter first (filters students registered in range or remarks logged in range)
    let filteredStudents = uniqueStudents;
    if (startD || endD) {
      filteredStudents = filteredStudents.filter(st => {
        const sId = String(st._id);
        const sRemarks = remarksByStudent[sId] || [];
        const regDate = new Date(st.createdAt);
        const latestRem = sRemarks[0];
        const remarkDate = latestRem ? new Date(latestRem.createdAt) : null;

        const matchesReg = (!startD || regDate >= startD) && (!endD || regDate <= endD);
        const matchesRemark = remarkDate && (!startD || remarkDate >= startD) && (!endD || remarkDate <= endD);
        return matchesReg || matchesRemark;
      });
    }

    const statusCounts = {};
    let callsDone = 0;
    let filteredRemarksCount = 0;

    let enrichedStudents = filteredStudents.map(st => {
      const sId = String(st._id);
      const sRemarks = remarksByStudent[sId] || [];
      const userMadeRemarks = sRemarks.filter(r => String(r.admin?._id || r.admin) === String(userId));
      const latestRemark = sRemarks[0] || null;
      const currentStatus = latestRemark ? latestRemark.status : "No Status";

      statusCounts[currentStatus] = (statusCounts[currentStatus] || 0) + 1;
      if (sRemarks.length > 0) callsDone++;
      filteredRemarksCount += userMadeRemarks.length;

      return {
        ...st,
        currentStatus,
        totalRemarks: sRemarks.length,
        userRemarksCount: userMadeRemarks.length,
        latestRemarkText: latestRemark?.text || "-",
        latestRemarkBy: latestRemark?.admin?.userName || "-",
        latestRemarkAt: latestRemark?.createdAt || null,
        allRemarks: sRemarks
      };
    });

    // Apply status filter if provided
    if (status && status !== "all") {
      enrichedStudents = enrichedStudents.filter(st => st.currentStatus === status);
    }

    const totalAssignedLeads = enrichedStudents.length;
    const finalCallsDone = enrichedStudents.filter(st => st.totalRemarks > 0).length;
    const pendingLeads = Math.max(0, totalAssignedLeads - finalCallsDone);

    res.status(200).json({
      success: true,
      user,
      stats: {
        totalAssignedLeads,
        callsDone: finalCallsDone,
        pendingLeads,
        todayCalls,
        totalRemarks: filteredRemarksCount,
        assignedCollegesCount: activeColleges.length,
        assignedAssessmentsCount: activeAssessments.length,
        statusCounts
      },
      userColleges: allUserColleges,
      assignments: assignmentHistory,
      students: enrichedStudents
    });
  } catch (error) {
    console.error("GET USER LEAD REPORT ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
