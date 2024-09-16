import mongoose from 'mongoose';

const beneficiaryDetailsSchema = new mongoose.Schema({
    singleBeneficiaryDocUploaded: {
        type: Boolean,
        default: false // Default value is false
    },
    
    remarks: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'remark'
    },
    khatauniId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'khatauniDetails',
        required: true
    },
    villageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'villageDetails'
    },
    update: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'update'
    },
    beneficiaryName: {
        type: String, // Assuming this is a name string, not an ID
        required: true,
        maxlength: 250,
        minlength: 3
    },
    beneficiaryStatus: {
        type: String,
        required: true,
        enum: ['0', '1']
    },
    beneficiaryType: {
        type: String,
        required: true,
        enum: ['0', '1', '2', '3', '4']
    },
    NOKid: {
        type: String
    },
    POAid: {
        type: String
    },
    NOKHid: {
        type: String
    },
    POAHid: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        enum: ['0', '1']
    },
    deletedAt: {
        type: Date
    },
    isDisputed: {
        date: Date
    },
    beneficiaryShare: {
        type: String,
        required: true
    },
    acquiredBeneficiaryShare: {
        type: String,
        required: true
    },
    isDocUploaded: {
        type: Boolean,
        required: true,
        enum: ['0', '1']
    },
    isDisbursementUploaded: {
        type: Boolean,
        required: true,
        enum: ['0', '1']
    },
    isConsent: {
        type: Boolean,
        required: true
    },
    landPriceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'landPrice'
    }
});

export const beneficiaryDetails = mongoose.model('beneficiaryDetails', beneficiaryDetailsSchema);
