import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react'

const Tester = () => {

  let [count, setCount] = useState(false);
  let [temp, setTemp] = useState(0);

  useEffect(() => {
    setTemp(temp + 1)
  }, [count, temp])

  useEffect(() => {
    alert("Page was rendered")
  }, [])
  
    
  return (
    <>
      <button style={{"minHeight":"50px","margin":"10px"}} onClick={() => setCount(!count)}>This is a simple button</button>
      {count && <div>This text will appear depending on the current state of the button</div>}
      <div>Count was changed this many times {temp}</div>
    </>
  )
}

export default Tester