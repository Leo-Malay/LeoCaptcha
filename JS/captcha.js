/**
 * Name: LeoCaptcha
 * Author: Malay Bhavsar
 * Email: malaybhavsar.290@gmail.com
 */
class LeoCaptcha {
    constructor(
        canvasId = "myCanvas",
        inputBoxId = "myTextBox",
        captchaType = "AlphaNumeric",
        captchaLength = 5
    ) {
        this.__canvasId = canvasId;
        this.__inputBoxId = inputBoxId;
        this.__captchaType = captchaType;
        this.__captchaLength = captchaLength;
        this.setRotate();
        this.setColor();
        this.setBgColor();
        this.__captchaText = null;
        try {
            this.__captchaCanvas = document.getElementById(this.__canvasId);
            this.__canvasOut = this.__captchaCanvas.getContext("2d");
            // Setting default size.
            this.setDimension();
            // Setting font size.
            this.__canvasOut.font = this.__height / 1.5 + "px Verdana";
        } catch (error) {
            console.log("Unable to find the canvas.", error);
        }
        try {
            this.__captchaInputBox = document.getElementById(this.__inputBoxId);
        } catch (error) {
            console.log("Unable to find the captcha input box.", error);
        }
    }
    displayCaptcha() {
        // Private functions.
        const __generateCaptcha = (captchaLength) => {
            const __numericCaptcha = () => {
                var temp = Math.floor(Math.random() * 99) % 58;
                if (temp < 48)
                    temp = 48 + (Math.floor(Math.random() * 99) % 10);
                return temp;
            };
            const __alphaCaptcha = () => {
                var temp = Math.floor(Math.random() * 99999) % 123;
                if (temp < 65)
                    temp = 65 + (Math.floor(Math.random() * 99) % 58);
                if (90 < temp && temp < 97)
                    temp = 97 + (Math.floor(Math.random() * 99) % 26);
                return temp;
            };
            const __alphaNumericCaptcha = () => {
                var temp = Math.floor(Math.random() * 99999) % 123;
                if (temp < 48)
                    temp = 48 + (Math.floor(Math.random() * 999) % 75);
                if (57 < temp && temp < 65)
                    temp = 65 + (Math.floor(Math.random() * 99) % 58);
                if (90 < temp && temp < 97)
                    temp = 97 + (Math.floor(Math.random() * 99) % 26);
                return temp;
            };
            let temp,
                res = [];
            while (captchaLength > 0) {
                switch (this.__captchaType) {
                    case "Numeric":
                        temp = __numericCaptcha();
                        break;
                    case "Alpha":
                        temp = __alphaCaptcha();
                        break;
                    case "AlphaNumeric":
                        temp = __alphaNumericCaptcha();
                        break;
                }
                res.push(String.fromCharCode(temp));
                captchaLength--;
            }
            return res;
        };
        const __displayMathCaptcha = () => {
            this.__captchaLength = 7;
            let a = Math.floor(Math.random() * 100),
                b = Math.floor(Math.random() * 10),
                sign = __selectRandom(["+", "-"]),
                temp;
            __writeText(a, 0);
            __writeText(sign, 2);
            __writeText(b, 3);
            __writeText("=", 4);
            __writeText("__", 5);
            switch (sign) {
                case "+":
                    temp = a + b;
                    break;
                case "-":
                    temp = a - b;
                    break;
            }
            this.__captchaText = __hash(String(temp));
        };
        const __hash = async (message) => {
            const msgUint8 = new TextEncoder().encode(message);
            const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray
                .map((b) => b.toString(16).padStart(2, "0"))
                .join("");
            return hashHex;
        };
        const __clearCanvas = () => {
            // Clear Canvas
            this.__canvasOut.clearRect(0, 0, this.__width, this.__height);
        };
        const __setBgColor = () => {
            // Set Background Color
            this.__canvasOut.fillStyle = __selectRandom(this.__bgColorArray);
            this.__canvasOut.fillRect(0, 0, this.__width, this.__height);
        };
        const __selectRandom = (array) => {
            // Selects a random array element;
            return array[Math.floor(Math.random() * array.length)];
        };
        const __writeText = (val, index) => {
            this.__canvasOut.save();
            if (this.__enableRotate)
                this.__canvasOut.rotate(__selectRandom(this.__rotateArray));
            if (this.__enableColor)
                this.__canvasOut.fillStyle = __selectRandom(this.__colorArray);
            this.__canvasOut.fillText(
                val,
                10 + (index * this.__width * 0.8333) / this.__captchaLength,
                10 + this.__height / 2
            );
            this.__canvasOut.restore();
        };
        // Actual Function
        __clearCanvas();
        if (this.__enableBgColor) __setBgColor();
        this.__canvasOut.fillStyle = "#000";
        if (this.__captchaType === "Math") __displayMathCaptcha();
        else {
            // Writing the captcha text
            const temp = __generateCaptcha(this.__captchaLength);
            temp.forEach((val, index) => __writeText(val, index));
            // Setting the value for verification.
            this.__captchaText = __hash(temp.join(""));
        }
    }
    verifyCaptcha(successCallBack = () => true, failureCallBack = () => false) {
        const __hash = async (message) => {
            const msgUint8 = new TextEncoder().encode(message);
            const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray
                .map((b) => b.toString(16).padStart(2, "0"))
                .join("");
            return hashHex;
        };
        const inputCaptchaValue = __hash(this.__captchaInputBox.value);
        this.__captchaInputBox.value = null;
        this.__captchaText.then((generatedCaptcha) => {
            inputCaptchaValue.then((inputCaptcha) => {
                if (generatedCaptcha === inputCaptcha) successCallBack();
                else failureCallBack();
            });
        });
        // Refresh Captcha Regardless of success or failure
        this.displayCaptcha(this.__captchaLength);
        // Comparision of the captcha
    }
    // Setter Method
    setDimension(width = 200, height = 50) {
        this.__width = width;
        this.__height = height;
        this.__captchaCanvas.width = this.__width;
        this.__captchaCanvas.height = this.__height;
    }
    setRotate(
        enableRotate = true,
        rotateArray = [
            0, 0.01, -0.015, 0.02, -0.025, 0.03, -0.035, 0.04, -0.045, 0.05,
            -0.01, 0.015, -0.02, 0.025, -0.03, 0.035, -0.04, 0.045, -0.05,
        ]
    ) {
        this.__enableRotate = enableRotate;
        this.__rotateArray = rotateArray;
    }
    setColor(
        enableColor = true,
        colorArray = ["#f00", "#00f", "#a52a2a", "#000"]
    ) {
        this.__enableColor = enableColor;
        this.__colorArray = colorArray;
    }
    setBgColor(
        enableBgColor = true,
        bgColorArray = ["#fff", "#e6e6e6", "#ccc", "#b3b3b3"]
    ) {
        this.__enableBgColor = enableBgColor;
        this.__bgColorArray = bgColorArray;
    }
}
/**
 * HTML Code for this file
 * <canvas id="myCanvas"></canvas>
        <input
            type="button"
            onclick="captcha.displayCaptcha()"
            value="Reload"
        />
        <br />
        <input type="text" name="CaptchaText" id="myTextBox" />
        <input
            type="button"
            onclick="captcha.verifyCaptcha(()=>{alert(true)}, ()=>{alert(false)})"
            value="Submit"
        />
 */
