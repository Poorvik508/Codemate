import bcrypt from 'bcryptjs'
import jwt from "jsonwebtoken"
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from"../config/emailTemplates.js";
export const register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
    {
        return res.json({ success:false,message:"missing Details"})
    }
    try {
        const existingUser = await userModel.findOne({ email })
        if (existingUser)
        {
            
            return res.json({success:false,message:"User alreday exists"})
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = new userModel({ name, email, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge:7 *24*60*60*1000
            

        })
         //IDEA:sending welcome email

         const mailOptions = {
            from:"poorvikp94@gmail.com",
            to: email,
            subject: "welcome to authentication-system",
            text:`welcome to  authenticaion system .Your account has been created with email id:${email}`
        }
        try {
            
            await transporter.sendMail(mailOptions);
            console.log("email sent")
        } catch (error)
        {
            console.log("email failed:",error.message)
        }
        
        return res.json({success:true})
    } catch (error)
    {
        res.json({success:false,message:error.message})
    }
}
export const login = async(req, res) =>{
    const { email, password } = req.body;
    if (!email || !password)
    {
        return res.json({success:false,message:"email and password are required"})
    }
    try {
        const user = await userModel.findOne({ email })
        if (!user)
        {
            return res.json({success:false,message:"Invalid  Email"})
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch)
        {
            return res.json({success:false,message:"Invalid Password"})
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
            

        });
       
        return res.json({success:true})

    } catch (error)
    {
        return res.json({success:false,message:error.message})
    }
}
export const logout = async (req,res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge:7 *24*60*60*1000
        })
        return res.json({success:true,message:"Logged Out"})
    } catch (error){
        return res.json({success:false,message:error.message})
    }
}

export const sendVerifyOtp = async (req, res) => {
  try {
    const userId = req.userId; // ✅ Get from verified token

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isAccountVerified) {
      return res.json({
        success: false,
        message: "Account is already verified",
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    const mailOptions = {
      from: "poorvikp94@gmail.com",
      to: user.email,
      subject: "Account Verification OTP",
        // text: `Your OTP is ${otp}. Verify your account using this OTP`,
      html:EMAIL_VERIFY_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("OTP sent");
      res.json({
        success: true,
        message: "Verification OTP sent to your email",
      });
    } catch (error) {
      console.log("OTP failed:", error.message);
      res.json({
        success: false,
        message: "Failed to send OTP email",
      });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req,res) => {
   const { otp } = req.body;
    const userId = req.userId;

    if (!userId || !otp) {
        return res.json({success:false,message:'Missing Details'})
    }
    try {
        const user=await userModel.findById(userId)
        if (!user)
        {
            return res.json({ success: false, message: "user not found" });

        }
        if (user.verifyOtp === '' || user.verifyOtp!=otp)
        {
            return res.json({success:false,message:"Invalid OTP"})
        }
        if (user.verifyOtpExpireAt < Date.now())
        {
            return res.json({success:false,message:"OTP is Expired"})
        }
        user.isAccountVerified = true;
        user.verifyOtp = " "
        user.verifyOtpExpireAt = 0;
        await user.save();
        return res.json({ success:true,message:"email verified successfully"})
    } catch (error) {
        return res.json({success:false,message:error.message})
    }

}
export const isAuthenticated = async (req,res) => {
    try {
          
        return res.json({success:true})

    } catch (error)
    {
        res.json({ success: false, message: error.message });
    }
}

export const sendResetOtp = async (req,res) => {
    const { email } = req.body;
    if (!email)
    {
        return res.json({ success:false,message:"Email is required"})
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success:false,message:"Email Not Found"})
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000))
        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 *60 * 1000

        await user.save();
        const mailOptions = {
            from:"poorvikp94@gmail.com",
            to: user.email,
            subject: "Password Reset OTP",
            // text:`Your OTP is ${otp}. Reset your Password using this OTP`
          html:PASSWORD_RESET_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
        }
        try {
            
            await transporter.sendMail(mailOptions);
            console.log("OTP sent")
          return  res.json({success:true,message:" OTP sent To Your Mail"})
        } catch (error)
        {

            console.log("OTP failed:",error.message)
        }
    } catch (error)
    {
        return res.json({success:false,message:error.message})
    }
}

export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
    {
        return res.json({success:false,message:"Email,OTP and  PASSWORD   are required"})
    }
    try {
        const user = await userModel.findOne({ email })
        if (!user)
        {
            
            return res.json({ success: false, message: error.message })
        }
        if(user.resetOtp===" " ||user.resetOtp!=otp )
        {
            return res.json({ success: false, message:"Invalid OTP" })
        }

        if (user.resetOtpExpireAt<Date.now())
        {
            return res.json({ success: false, message:"OTP Expired" })
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOtp = " ";
        user.resetOtpExpireAt = 0;
        await user.save()

        return res.json({ success: true, message:"password has been reset successfully" })

    } catch (error)
    {
        return res.json({success:false,message:error.message})
    }
}


