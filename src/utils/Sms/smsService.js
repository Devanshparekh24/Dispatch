 const sendSMS = async (mobileNumber, otp) => {
    try {
        // const message = `${otp} is your OTP for Password change. Do not share it with anyone. Spectrum Dyes and Chemicals`;
        const message = `Your OTP for Attendance Application is ${otp}. Do not share this code with anyone. Spectrum Dyes`;

        const queryParams = new URLSearchParams({
            'user': 'spectrum ',
            'password': '27ffd59b98XX',
            'mobiles': mobileNumber,
            // 'senderid': 'SDCHRD',
            'senderid': 'SDCITM',
            'sms': message,
            'accusage': '1',
            'tempid': '1707176647544250539'
        });

        console.log("Sending SMS to:", mobileNumber);

        const response = await fetch('https://sms.smsmenow.in/sendsms.jsp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': 'JSESSIONID=CDB7B70211872AEBB2052BE73FB54A84'
            },
            body: queryParams.toString()
        });

        // if (response.status !== 'success') {
        //     console.log(response.reason);
        // }
        const responseText = await response.text();

        console.log("SMS Response:", responseText);
        return responseText;
    } catch (error) {
        console.error("SMS Sending Error:", error);
        throw error;
    }
};

export default sendSMS;