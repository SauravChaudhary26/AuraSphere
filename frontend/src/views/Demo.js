import { useEffect, useState } from "react";
import axios from "axios";

const Demo = () => {
   const url = "https://jsonplaceholder.typicode.com/users";

   const [data, setData] = useState([]);

   useEffect(() => {
      const getapi = async () => {
         const response = await axios.get(url);

         console.log(response.data);
         setData(response.data);
      };
      getapi();
   }, []);

   return (
      <div>
         {data.map((user) => (
            <div>
               <div>user.name</div>
               <div>user.userName</div>
               <div>user.email</div>
            </div>
         ))}
      </div>
   );
};

export default Demo;
