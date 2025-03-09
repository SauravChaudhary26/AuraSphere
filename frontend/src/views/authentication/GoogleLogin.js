import GoogleIcon from "../../assets/google-icon";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { IconButton } from "@mui/material";
import axios from "axios";
import { handleError } from "../../utils/ToastMessages";

const GoogleLogin = () => {
   //Google Login Code
   const navigate = useNavigate();
   const responseGoogle = async (authResult) => {
      try {
         if (authResult["code"]) {
            console.log(authResult.code);
            const code = authResult.code;
            const url = `http://localhost:8080/auth/google?code=${authResult.code}`;
            const result = await axios.get(url, { code });
            localStorage.setItem("token", result.data.jwtToken);
            localStorage.setItem("loggedInUser", result.data.name);
            navigate("/dashboard");
         } else {
            console.log(authResult);
            throw new Error(authResult);
         }
      } catch (e) {
         handleError("Create an account first");
         console.log("Error while Google Login...", e);
      }
   };

   const googleLogin = useGoogleLogin({
      onSuccess: responseGoogle,
      onError: responseGoogle,
      flow: "GeneralOAuthFlow",
   });

   return (
      <IconButton onClick={googleLogin}>
         <GoogleIcon width="32px" height="32px" />
      </IconButton>
   );
};

export default GoogleLogin;
