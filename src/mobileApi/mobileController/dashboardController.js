import { catchAsyncError } from '../../middleware/catchAsyncError.js';
import { mobileDashboard } from './../mobileModel/mobileDashboardSchema.js';
import { beneficiaryDocs } from '../../schema/beneficiaryDocDetailSchema.js';
import { beneficiaryDetails } from '../../schema/beneficiaryDetailsSchema.js';
import ErrorHandler from '../../middleware/error.js';
import mongoose from 'mongoose'
import {khatauniDetails} from '../../schema/khatauniDetails.js'
import uploadDocsMiddleware from '../../middleware/multerconfig.js';

export const getVillageDetails = catchAsyncError(async (req, res, next) => {
    try {
        const { userId } = req.query;

        // If userId is provided, ensure we proceed
        if (!userId) {
            return next(new ErrorHandler('User ID is required.', 400));
        }

        // Fetch village details from mobileDashboard and populate khatauniId and related fields for each village
        const villagesDetails = await mobileDashboard.find()
            .populate({
                path: 'khatauniId',  // Populate the khatauniId field, which references the khatauniDetails schema
                select: 'khatauniSankhya khasraNumber areaVolume acquiredKhasraNumber',  // Select relevant fields from khatauniDetails
            })
            .populate('beneficiaryName', 'beneficiaryName')  // Populate beneficiaryName field if needed
            .exec();

        if (!villagesDetails || villagesDetails.length === 0) {
            return next(new ErrorHandler('No village details found.', 404));
        }

        // Format the village details for each village entry
        const formattedVillagesDetails = villagesDetails.map(village => ({
            id: village._id,
            khatauniId: village.khatauniId ? village.khatauniId._id : 'N/A',  // Fetch the MongoDB _id of khatauniDetails
            khatauniSankhya: village.khatauniId ? village.khatauniId.khatauniSankhya : 'N/A',  // Fetch khatauniSankhya from khatauniDetails
            khasraNumber: village.khatauniId ? village.khatauniId.khasraNumber : 'N/A',  // Fetch khasraNumber from khatauniDetails
            areaVolume: village.khatauniId ? village.khatauniId.areaVolume : 'N/A',  // Fetch areaVolume from khatauniDetails
            acquiredKhasraNumber: village.khatauniId ? village.khatauniId.acquiredKhasraNumber : 'N/A',  // Fetch acquiredKhasraNumber from khatauniDetails
            beneficiaryName: village.beneficiaryName ? village.beneficiaryName.beneficiaryName : 'N/A',  // Fetch beneficiaryName if available
        }));

        // Send response in the required format
        res.status(200).json({
            status: true,
            message: 'Success',
            villagesDetails: formattedVillagesDetails
        });
    } catch (error) {
        console.error('Error:', error);
        next(error);
    }
});
export const getVillageDetailsWithBeneficiaryCount = catchAsyncError(async (req, res, next) => {
    try {
        // Extract query parameters
        const { userId,khatauniId, khatauniSankhya } = req.query;
        console.log('Query Parameters:', { khatauniId, khatauniSankhya });

        // Validate the query parameters
        if (!userId ||!khatauniId || !khatauniSankhya) {
            console.log('Validation Error: Missing Khatauni ID or Sankhya');
            return next(new ErrorHandler('Khatauni ID, userId and Sankhya are required.', 400));
        }

        // Fetch the village details based on khatauniId and khatauniSankhya
        const village = await khatauniDetails.findOne({
            _id: khatauniId,
            khatauniSankhya: khatauniSankhya
        }).exec();
        console.log('Fetched Village:', village);

        if (!village) {
            console.log('No village found for provided Khatauni ID and Sankhya');
            return next(new ErrorHandler('No village details found for the provided Khatauni ID and Sankhya.', 404));
        }

        // Fetch beneficiaries related to the khatauniId
        const beneficiaries = await beneficiaryDetails.find({ khatauniId });
        console.log('Fetched Beneficiaries:', beneficiaries);

        // Create the list of beneficiaries with ID and name
        const beneficiaryList = beneficiaries.reduce((acc, beneficiary) => {
            // Check if beneficiaryName exists and is a string
            if (beneficiary.beneficiaryName && typeof beneficiary.beneficiaryName === 'string') {
                const names = beneficiary.beneficiaryName.split(',').map(name => name.trim());
                names.forEach((name, index) => {
                    acc.push({
                        id: acc.length + 1,
                        name
                    });
                });
            } else {
                console.log('Skipped a beneficiary with invalid or missing beneficiaryName:', beneficiary);
            }
            return acc;
        }, []);
        console.log('Formatted Beneficiary List:', beneficiaryList);

        // Send the response
        res.status(200).json({
            success: true,
            message: 'Village details with beneficiary counts fetched successfully.',
            beneficiaries: beneficiaryList,
            khasraNumber: village.khasraNumber,
            areaVolume: village.areaVolume,
            khatauniSankhya: village.khatauniSankhya,
            beneficiaryCount: beneficiaryList.length
        });
    } catch (error) {
        console.error('Error:', error);
        next(error);
    }
});



export const uploadDocs = catchAsyncError(async (req, res, next) => {
    try {
        const { beneficiaryId } = req.body;
        const { beneficiaryName } = req.body;

        // Validate beneficiaryId and beneficiaryName
        if (!beneficiaryId || !beneficiaryName) {
            return res.status(400).json({
                success: false,
                message: "Beneficiary ID and name are required",
            });
        }

        // Find the beneficiary
        const beneficiary = await beneficiaryDetails.findById(beneficiaryId);

        if (!beneficiary) {
            return res.status(404).json({
                success: false,
                message: "Beneficiary not found",
            });
        }

        // Convert beneficiary names to an array
        const beneficiaryNames = beneficiaryName.split(',').map(name => name.trim().toLowerCase());

        // Process document files
        const documents = {
            landIndemnityBond: req.files['landIndemnityBond'] ? req.files['landIndemnityBond'].map(file => file.path.replace(/\\/g, '/')) : [],
            structureIndemnityBond: req.files['structureIndemnityBond'] ? req.files['structureIndemnityBond'].map(file => file.path.replace(/\\/g, '/')) : [],
            uploadAffidavit: req.files['uploadAffidavit'] ? req.files['uploadAffidavit'].map(file => file.path.replace(/\\/g, '/')) : [],
            aadhaarCard: req.files['aadhaarCard'] ? req.files['aadhaarCard'].map(file => file.path.replace(/\\/g, '/')) : [],
            panCard: req.files['panCard'] ? req.files['panCard'].map(file => file.path.replace(/\\/g, '/')) : [],
            photo: req.files['photo'] ? req.files['photo'].map(file => file.path.replace(/\\/g, '/')) : [],
            chequeOrPassbook: req.files['chequeOrPassbook'] ? req.files['chequeOrPassbook'].map(file => file.path.replace(/\\/g, '/')) : [],
        };
        console.log(req.body);
        // Parse additional fields if provided
        const aadhaarNumbers = req.body.aadhaarNumber ? JSON.parse(req.body.aadhaarNumber.replace(/^"|"$/g, '')) : [];
        const panCardNumbers = req.body.panNumber ? JSON.parse(req.body.panNumber.replace(/^"|"$/g, '')) : [];
        const confirmAccountNumber = req.body.confirmAccountNumber || '';
        const isConsent = req.body.isConsent === 'true';
        const remarks = req.body.remarks ? req.body.remarks.replace(/^'|'$/g, '') : '';
        const ifscCodes = req.body.ifscCode ? JSON.parse(req.body.ifscCode.replace(/^"|"$/g, '')) : [];
        const accountNumbers = req.body.accountNumber ? JSON.parse(req.body.accountNumber.replace(/^"|"$/g, '')) : [];

        // Prepare update data
        const updateData = {
           
                
    
            isConsent: isConsent,
            remarks: remarks,
            documents: {
                landIndemnityBond: documents.landIndemnityBond,
                structureIndemnityBond: documents.structureIndemnityBond,
                uploadAffidavit: documents.uploadAffidavit,
                aadhaarCard: documents.aadhaarCard,
                panCard: documents.panCard,
                photo: documents.photo,
                chequeOrPassbook: documents.chequeOrPassbook,
                accountNumber: accountNumbers,
                ifscCode: ifscCodes ,
                confirmAccountNumber: confirmAccountNumber ,
                aadhaarNumber: aadhaarNumbers,
                panNumber: panCardNumbers,
            }
        };
        console.log(updateData);
        

        // Update or create the document
        const existingDoc = await beneficiaryDocs.findOneAndUpdate(
            { beneficiaryId: beneficiaryId },
            {
                $addToSet: {
                    beneficiaryName: { $each: beneficiaryNames }
                },
                $push: {
                    'documents.landIndemnityBond': { $each: updateData.documents.landIndemnityBond },
                    'documents.structureIndemnityBond': { $each: updateData.documents.structureIndemnityBond },
                    'documents.uploadAffidavit': { $each: updateData.documents.uploadAffidavit },
                    'documents.aadhaarCard': { $each: updateData.documents.aadhaarCard },
                    'documents.panCard': { $each: updateData.documents.panCard },
                    'documents.photo': { $each: updateData.documents.photo },
                    'documents.chequeOrPassbook': { $each: updateData.documents.chequeOrPassbook },
                    'documents.aadhaarNumber': { $each: updateData.documents.aadhaarNumber },
                    'documents.panNumber': { $each: updateData.documents.panNumber },
                    'documents.accountNumber': { $each: updateData.documents.accountNumber },
                    'documents.ifscCode': { $each: updateData.documents.ifscCode },
                    // 'documents.confirmAccountNumber': { $each: updateData.documents.confirmAccountNumber }
                },
                $set: {
                    isConsent: updateData.isConsent,
                    remarks: updateData.remarks
                }
            },
            { new: true, upsert: true }
        );
        console.log(existingDoc);
        

        // Return success response
        res.status(200).json({
            success: true,
            message: 'Documents and details uploaded successfully for the beneficiary.',
            // data: {
            //     beneficiaryId: existingDoc.beneficiaryId,
            //     beneficiaryName: beneficiaryNames[0] || '', // Use the first name or default to empty string
            //     lastUpdated: existingDoc.updatedAt,
            //     uploadedDocuments: existingDoc
            // }
        });
    } catch (error) {
        console.error("Error in uploadDocs:", error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
});







