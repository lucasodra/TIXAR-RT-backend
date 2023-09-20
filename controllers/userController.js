const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const axios = require('axios');
const generateOTP = require('../utils/otpGenerator');
const User = require('../models/userModel');

const userController = {

  register: async (req, res) => {
    try {
      const { phone, firstName, lastName } = req.body;
      const user = await User.findOne({ phone });

      if (user) {
        return res.status(400).json({ message: "User already exists!" });
      }

      const newUser = new User({ 
        phone: phone,
        firstName: firstName,
        lastName: lastName
        });

      await newUser.save();

      res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  telebotCallback: async (req, res) => {
    try {
        const { contact, telegramId, token } = req.body;

        if (token != process.env.OTP_KEY) {
            return res.status(404).json({ message: "Error" });
        }

        const user = await User.findOne({ phone: contact });

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        } else {
            user.otpDevice.deviceType = "telegram";
            user.otpDevice.deviceKey = telegramId;
            await user.save();
            return res.status(200).json({message: "ok"});
        }
        
    } catch (err) {
        res.status(500).json({message: err.message});
    }
  },

  requestOtp: async (req, res) => {
    try {
      const { phone } = req.body;
      const user = await User.findOne({ phone });

      if (!user) {
        return res.status(404).json({ message: "User not found!" });
      }

      const otpValue = generateOTP(); 
      user.otpValue = otpValue;
      user.otpExpiry = new Date(Date.now() + 60000); 
      await user.save();

      const dataToSend = {
        telegramId: user.otpDevice.deviceKey,
        code: otpValue
      };

      axios.post(process.env.OTP_URL + '/send', dataToSend)
            .then(response => {
            console.log('Data:', response.data);
            })
            .catch(error => {
            console.error('Error sending POST request:', error);
            });

      res.status(200).json({ message: "OTP sent successfully!" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  login: async (req, res) => {
    try {
      const { phone, otp } = req.body;
      const user = await User.findOne({ phone });
    
      if (!user) {
        return res.status(404).json({ message: "User not found!" });
      }

      if (user.otpAttempt >= 5) {
        if (user.otpLast < Date.now()) {
            user.otpAttempt = 0;
        } else {
            return res.status(400).json({ message: "Wait 15 minutes!" });
        }
      }

      if (user.otpExpiry < Date.now()) {
        return res.status(400).json({ message: "OTP Expired" });
      }
      
      const isOtpMatch = await user.compareOtp(otp);

      if (!isOtpMatch) {
        user.otpAttempt = user.otpAttempt + 1;
        user.otpLast = Date.now();
        await user.save();
        return res.status(401).json({ message: "Invalid OTP!" });
      }

      user.otpAttempt = 0;
      const token = await user.generateToken();
      await user.save();

      res.status(200).json({ token, message: "Logged in successfully!" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  addCreditCard: async (req, res) => {
    try {
      const { customer } = req.body;
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ message: "User not found!" });
      }

      user.customer = customer;
      await user.save();

      res.status(200).json({ message: "Credit card added successfully!" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  updateCreditCard: async (req, res) => {
    try {
      const { customer } = req.body;
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ message: "User not found!" });
      }

      user.customer = { ...user.customer, ...customer };
      await user.save();

      res.status(200).json({ message: "Credit card updated successfully!" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  updateName: async (req, res) => {
    try {
      const { firstName, lastName } = req.body;
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ message: "User not found!" });
      }

      user.firstName = firstName;
      user.lastName = lastName;
      await user.save();

      res.status(200).json({ message: "Name updated successfully!" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = userController;