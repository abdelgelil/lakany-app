const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');

// @desc    Get financial stats for Lakany Pain Clinic
// @route   GET /api/enterprise/finance-stats
exports.getDoctorStats = async (req, res, next) => {
    try {
        const { role } = req.user;
        const userId = req.user._id;
        const { doctorId } = req.query;

        let matchStage = {};

        // 1. Define Access Logic
        if (role === 'doctor') {
            matchStage.doctorId = new mongoose.Types.ObjectId(userId);
        } else if ((role === 'management' || role === 'admin') && doctorId) {
            matchStage.doctorId = new mongoose.Types.ObjectId(doctorId);
        } 

        // 2. Aggregate Data
        const stats = await Appointment.aggregate([
            { $match: matchStage },
            {
                $facet: {
                    totalRevenue: [
                        { $match: { status: 'completed' } },
                        { $group: { _id: null, total: { $sum: '$price' } } }
                    ],
                    appointmentCount: [
                        { $group: { _id: '$status', count: { $sum: 1 } } }
                    ],
                    monthlyBreakdown: [
                        { $match: { status: 'completed' } },
                        {
                            $group: {
                                _id: { 
                                    year: { $year: '$date' }, 
                                    month: { $month: '$date' } 
                                },
                                monthlyTotal: { $sum: '$price' },
                                count: { $sum: 1 }
                            }
                        },
                        { $sort: { '_id.year': -1, '_id.month': -1 } },
                        { $limit: 12 }
                    ],
                    recentTransactions: [
                        { $sort: { date: -1 } },
                        { $limit: 10 },
                        // 🔥 ADDED: Pull patient data from users collection
                        {
                            $lookup: {
                                from: 'users', 
                                localField: 'patientId',
                                foreignField: '_id',
                                as: 'patientInfo'
                            }
                        },
                        {
                            $project: {
                                date: 1,
                                price: 1,
                                status: 1,
                                // 🔥 Pull the username from the joined patientInfo array
                                patientName: { $arrayElemAt: ['$patientInfo.username', 0] },
                                doctorId: 1
                            }
                        }
                    ]
                }
            }
        ]);

        const statsData = stats[0];

        res.status(200).json({
            success: true,
            data: {
                totalRevenue: statsData.totalRevenue[0]?.total || 0,
                appointmentCount: statsData.appointmentCount,
                monthlyBreakdown: statsData.monthlyBreakdown,
                recentTransactions: statsData.recentTransactions
            }
        });
    } catch (err) {
        next(err);
    }
};