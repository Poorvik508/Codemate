import nodemailer from 'nodemailer'
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "poorvikp94@gmail.com",
        pass:"dmov qtwj kdcp ncmv"
        
    }
    
});

export default transporter;