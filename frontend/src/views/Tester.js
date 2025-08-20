import { useState, useEffect } from "react";

const Tester = () => {
   const [count, setCount] = useState(["hello"]);

   useEffect(() => {
      setCount(5);
      console.log(count); // 0
      setCount([...count, "World"]);
   }, [count]);

   return <div>{count}</div>;
};

export default Tester;
