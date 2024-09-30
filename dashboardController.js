import { catchAsyncError } from '../../middleware/catchAsyncError.js';
import  beneficiaryDocs  from '../../schema/beneficiaryDocDetailSchema.js';
import ErrorHandler from '../../middleware/error.js';
import khatauniDetailsWeb from '../../webApi/webModel/khatauniDetailsSchema.js';
import beneficiardetailsschemas from '../../webApi/webModel/benificiaryDetail.js';
import villageList from '../../webApi/webModel/villageListSchema.js';
import mongoose from 'mongoose';

// DONT TOUCH THIS CODE //

// export const getVillageDetails = catchAsyncError(async (req, res, next) => {
//     try {
//         const { userId, villageId } = req.query;
//         // Ensure userId and villageId are provided
//         if (!userId) {
//             return next(new ErrorHandler('User ID is required.', 400));
//         }
//         // Fetch village details based on villageId if provided, else fetch all villages
//         const query = villageId ? { villageId } : {};
//         const villagesDetails = await khatauniDetailsWeb.find(query)
//             .populate({
//                 path: 'beneficiaryId',  // Ensure beneficiaryId is referenced correctly
//                 select: 'beneficiaryName',  // Select the beneficiaryName from the Beneficiary schema
//             })
//             .exec();

//         // Log the villages details for debugging
//         console.log('Villages Details Before Grouping:', villagesDetails);

//         if (!villagesDetails || villagesDetails.length === 0) {
//             return next(new ErrorHandler('No village details found.', 404));
//         }

//         // Group village details by khatauniSankhya
//         const groupedVillages = villagesDetails.reduce((acc, village) => {
//             const khatauniSankhya = village.khatauniSankhya || 'N/A';

//             // If khatauniSankhya is not already in the accumulator, create an entry for it
//             if (!acc[khatauniSankhya]) {
//                 acc[khatauniSankhya] = {
//                     id: village._id,
//                     khatauniId: village._id,
//                     khatauniSankhya,
//                     serialNumber: village.serialNumber || 'N/A',
//                     khasraNumber: village.khasraNumber || 'N/A',
//                     acquiredKhasraNumber: village.acquiredKhasraNumber || 'N/A',
//                     areaVariety: village.areaVariety || 'N/A',
//                     acquiredRakbha: village.acquiredRakbha || 'N/A',
//                     isAllDocumentSubmitted: village.isAllDocumentSubmitted || 'N/A',
//                     villageId: village.villageId || 'N/A',
//                     beneficiaries: ''  // String to hold comma-separated beneficiary names
//                 };
//             }

//             // Concatenate the beneficiary names into a comma-separated string
//             const beneficiaryName = village.beneficiaryId?.beneficiaryName || 'N/A';
//             acc[khatauniSankhya].beneficiaries = acc[khatauniSankhya].beneficiaries 
//                 ? `${acc[khatauniSankhya].beneficiaries}, ${beneficiaryName}` 
//                 : beneficiaryName;

//             return acc;
//         }, {});

//         // Convert the groupedVillages object to an array
//         const formattedVillagesDetails = Object.values(groupedVillages);

//         console.log('Formatted Grouped Villages Details:', formattedVillagesDetails);

//         // Send the formatted details as a response
//         res.status(200).json({
//             status: true,
//             message: 'Success',
//             villagesDetails: formattedVillagesDetails
//         });
//     } catch (error) {
//         console.error('Error:', error);
//         next(error);
//     }
// });

export const getVillageDetails = catchAsyncError(async (req, res, next) => {
    try {
        const { userId } = req.query;

        // Ensure userId is provided
        if (!userId) {
            return next(new ErrorHandler('User ID is required.', 400));
        }

        // Fetch village details based on villageId if provided, else fetch all villages
        const villagesDetails = await khatauniDetailsWeb.find()
            .populate({
                path: 'beneficiaryId',  // Ensure beneficiaryId is referenced correctly
                select: 'beneficiaryName',  // Select the beneficiaryName from the Beneficiary schema
            })
            .exec();

        // Log for debugging
        console.log('Villages Details Before Grouping:', villagesDetails);

        if (!villagesDetails || villagesDetails.length === 0) {
            return next(new ErrorHandler('No village details found.', 404));
        }

        // Fetch village names from the villageList schema
        const villageIds = villagesDetails.map(village => village.villageId);
        const villages = await villageList.find({ _id: { $in: villageIds } }).select('villageName villageNameHindi');

        // Log the fetched villages for debugging
        console.log('Fetched Villages:', villages);

        // Group village details by khatauniSankhya
        const groupedVillages = villagesDetails.reduce((acc, village) => {
            const khatauniSankhya = village.khatauniSankhya || 'N/A';
            
            // Get village name from the villageList schema
            const villageData = villages.find(v => v._id.toString() === village.villageId.toString());  // Compare ObjectIds as strings
            const villageName = villageData ? villageData.villageName : 'Unknown Village';

            // Log the current village processing
            console.log(`Processing village: ${khatauniSankhya}, villageId: ${village.villageId}, villageName: ${villageName}`);

            // If khatauniSankhya is not already in the accumulator, create an entry for it
            if (!acc[khatauniSankhya]) {
                acc[khatauniSankhya] = {
                    id: village._id,
                    khatauniId: village._id,
                    khatauniSankhya,
                    serialNumber: village.serialNumber || 'N/A',
                    khasraNumber: village.khasraNumber || 'N/A',
                    acquiredKhasraNumber: village.acquiredKhasraNumber || 'N/A',
                    areaVariety: village.areaVariety || 'N/A',
                    acquiredRakbha: village.acquiredRakbha || 'N/A',
                    isAllDocumentSubmitted: village.isAllDocumentSubmitted || 'N/A',
                    villageId: village.villageId || 'N/A',
                    villageName,  // Add villageName fetched from villageList schema
                    beneficiaries: '',  // String to hold comma-separated beneficiary names
                };
            }

            // Concatenate the beneficiary names into a comma-separated string
            const beneficiaryName = village.beneficiaryId?.beneficiaryName || 'N/A';
            acc[khatauniSankhya].beneficiaries = acc[khatauniSankhya].beneficiaries 
                ? `${acc[khatauniSankhya].beneficiaries}, ${beneficiaryName}` 
                : beneficiaryName;

            return acc;
        }, {});

        // Convert the groupedVillages object to an array
        const formattedVillagesDetails = Object.values(groupedVillages);

        console.log('Formatted Grouped Villages Details:', formattedVillagesDetails);

        // Send the formatted details as a response
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


// DONT TOUCH THIS CODE //

export const getBeneficiariesByKhatauniSankhya = catchAsyncError(async (req, res, next) => {
    try {
        const { khatauniSankhya } = req.query;
        console.log('Query Parameters:', { khatauniSankhya });

        // Validate query parameters
        if (!khatauniSankhya) {
            return next(new ErrorHandler('Khatauni Sankhya is required.', 400));
        }

        // Fetch all khatauni details matching the provided khatauniSankhya
        const villages = await khatauniDetailsWeb.find({
            khatauniSankhya: khatauniSankhya
        })
        .populate('beneficiaryId', 'beneficiaryId beneficiaryName')  // Populating beneficiary details
        .exec();

        if (!villages || villages.length === 0) {
            return next(new ErrorHandler('No beneficiaries found for the provided Khatauni Sankhya.', 404));
        }

        // Extract beneficiaries from all matched records and map them to the desired format
        const beneficiaries = villages.map(village => ({
            beneficiaryId: village.beneficiaryId._id,
            name: village.beneficiaryId.beneficiaryName
        }));

        // Extract khasraNumber, areaVariety, and khatauniSankhya from the first record (since they are the same for all)
        const { khasraNumber, areaVariety, khatauniSankhya: khatauni } = villages[0];

        // Calculate the total beneficiary count
        const totalBeneficiaryCount = beneficiaries.length;

        // Send the response with all beneficiaries and additional information
        res.status(200).json({
            success: true,
            message: 'Beneficiary details fetched successfully.',
            beneficiaries,  // List of beneficiaries with IDs and names
            beneficiaryCount: totalBeneficiaryCount,  // Total count of beneficiaries
            khasraNumber,  // Khasra Number
            areaVariety,   // Area Variety
            khatauniSankhya: khatauni  // Khatauni Sankhya
        });
    } catch (error) {
        console.error('Error:', error);
        next(error);
    }
});

export const uploadDocs = async (req, res) => {
    try {
        const { beneficiaries, khatauniSankhya } = req.body; // Removed beneficiaryId as it's no longer needed
        const files = req.files;

        // Convert req.files into a plain object for cleaner logging
        const cleanedFiles = JSON.parse(JSON.stringify(files));

        // Check if required fields are missing
        if (!beneficiaries || !khatauniSankhya || !Object.keys(cleanedFiles).length) {
            return res.status(400).json({
                status: false,
                message: 'Required fields are missing.',
                // filesReceived: cleanedFiles
            });
        }

        // Process beneficiaries and files
        const processedBeneficiaries = beneficiaries.map((beneficiary, index) => {
            const photo = (files[`beneficiaries[${index}][photo]`] && files[`beneficiaries[${index}][photo]`][0]?.filename) || '';
            const landIndemnityBond = (files[`beneficiaries[${index}][landIndemnityBond]`] && files[`beneficiaries[${index}][landIndemnityBond]`][0]?.filename) || '';
            const structureIndemnityBond = (files[`beneficiaries[${index}][structureIndemnityBond]`] && files[`beneficiaries[${index}][structureIndemnityBond]`][0]?.filename) || '';
            const uploadAffidavit = (files[`beneficiaries[${index}][uploadAffidavit]`] && files[`beneficiaries[${index}][uploadAffidavit]`][0]?.filename) || '';
            const aadhaarCard = (files[`beneficiaries[${index}][aadhaarCard]`] && files[`beneficiaries[${index}][aadhaarCard]`][0]?.filename) || '';
            const panCard = (files[`beneficiaries[${index}][panCard]`] && files[`beneficiaries[${index}][panCard]`][0]?.filename) || '';
            const chequeOrPassbook = (files[`beneficiaries[${index}][chequeOrPassbook]`] && files[`beneficiaries[${index}][chequeOrPassbook]`][0]?.filename) || '';

            return {
                beneficiaryId: new mongoose.Types.ObjectId(beneficiary.beneficiaryId), // Use specific beneficiaryId
                beneficiaryName: beneficiary.beneficiaryName || '',
                accountNumber: beneficiary.accountNumber || '',
                ifscCode: beneficiary.ifscCode || '',
                confirmAccountNumber: beneficiary.confirmAccountNumber || '',
                aadhaarNumber: beneficiary.aadhaarNumber || '',
                panCardNumber: beneficiary.panCardNumber || '',
                remarks: beneficiary.remarks || '',
                isConsent1: beneficiary.isConsent || '',
                isConsent2: beneficiary.isConsent || '', // Convert string to boolean
                // Convert string to boolean
                photo,
                landIndemnityBond,
                structureIndemnityBond,
                uploadAffidavit,
                aadhaarCard,
                panCard,
                chequeOrPassbook,
                khatauniSankhya // Include khatauniSankhya in each beneficiary object
            };
        });

        // Save or update beneficiary documents
        for (const beneficiary of processedBeneficiaries) {
            let beneficiaryDoc = await beneficiaryDocs.findOne({
                beneficiaryId: beneficiary.beneficiaryId,
                beneficiaryName: beneficiary.beneficiaryName
            });

            if (beneficiaryDoc) {
                // If document exists, update it
                Object.assign(beneficiaryDoc, beneficiary);
            } else {
                // If not, create a new one
                beneficiaryDoc = new beneficiaryDocs(beneficiary);
            }

            await beneficiaryDoc.save();
        }

        // Return success response
        res.status(200).json({
            status: true,
            message: 'Documents and beneficiary details uploaded successfully',
            data: processedBeneficiaries
        });
    } catch (error) {
        console.error('Error uploading documents:');
        res.status(500).json({
            status: false,
            message: 'Error uploading documents',
            // error: error.message
        });
    }
};
















