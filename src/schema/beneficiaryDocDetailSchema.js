import mongoose from 'mongoose';

const documentDetailsSchema = new mongoose.Schema({
    aadhaarNumber: {
        type: [String],
        default: []
    },
    panNumber: {
        type: [String],
        default: []
    },
    landIndemnityBond: {
        type: [String],
        default: []
    },
    structureIndemnityBond: {
        type: [String],
        default: []
    },
    uploadAffidavit: {
        type: [String],
        default: []
    },
    aadhaarCard: {
        type: [String],
        default: []
    },
    panCard: {
        type: [String],
        default: []
    },
    photo: {
        type: [String],
        default: []
    },
    chequeOrPassbook: {
        type: [String],
        default: []
    },
            accountNumber: {
            type: [String],
            default: []
        },
       
        ifscCode: {
            type: [String],
            default: []
        },
        confirmAccountNumber: {
            type: [String],
            default: []
        },
    remarks: {
        type: String,
        default: ''
    }
}, { _id: false });

const beneficiaryDocsSchema = new mongoose.Schema({
    beneficiaryId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'BeneficiaryDetails',
        unique: true
    },
    beneficiaryName: {
        type: [String],
        default: []
    },
    documents: {
        type: documentDetailsSchema,
        default: () => ({})
    },
    isConsent: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const beneficiaryDocs = mongoose.model('beneficiaryDocs', beneficiaryDocsSchema);
