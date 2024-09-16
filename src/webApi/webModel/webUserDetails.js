import mongoose from 'mongoose';
import validator from 'validator';

const webUserDetailsSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'webUserCredentials'
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
   
    phoneNumber: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^[0-9]{10}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    userRole: {
        type: String,
        trim: true
    },
  
    isUserDeleted: {
        type: Boolean, 
        required: true
    },
    updatedAt: {
        type: Date,
        required: true,
        default: Date.now 
    },
    deletedAt: {
        type: Date 
    }
}, { timestamps: true });

const webUserDetails = mongoose.model('webUserDetails', webUserDetailsSchema);
export default webUserDetails;
