import { useState } from "react";
import api from "../services/api";
import logo from "../assets/flipkart.png";

function Login(){

const [email,setEmail] = useState("");
const [password,setPassword] = useState("");

const handleLogin = async ()=>{

try{

const res = await api.post("/auth/login",{
email,
password
});

localStorage.setItem("token",res.data.token);

window.location.href="/dashboard";

}catch(err){

alert("Login failed");

}

};

return(

<div style={styles.container}>

<div style={styles.card}>

<img src={logo} style={styles.logo} />

<h1 style={styles.title}>TL Attendance</h1>

<p style={styles.subtitle}>
Team Leader Login Portal
</p>

<input
style={styles.input}
placeholder="Official Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
/>

<input
style={styles.input}
type="password"
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
/>

<button style={styles.button} onClick={handleLogin}>
Login
</button>

<p style={styles.footer}>
Powered by <b>PREXO</b>
</p>

</div>

</div>

);

}

const styles = {

container:{
height:"100vh",
display:"flex",
alignItems:"center",
justifyContent:"center",
background:"linear-gradient(135deg,#001f54,#003f88,#00509d)"
},

card:{
width:"360px",
padding:"40px",
background:"rgba(255,255,255,0.95)",
borderRadius:"14px",
boxShadow:"0 15px 40px rgba(0,0,0,0.4)",
textAlign:"center"
},

logo:{
width:"120px",
marginBottom:"10px"
},

title:{
color:"#2874F0",
marginBottom:"5px"
},

subtitle:{
color:"#555",
marginBottom:"25px"
},

input:{
width:"100%",
padding:"12px",
marginBottom:"15px",
borderRadius:"6px",
border:"1px solid #ccc",
fontSize:"14px"
},

button:{
width:"100%",
padding:"12px",
background:"#2874F0",
color:"#fff",
border:"none",
borderRadius:"6px",
cursor:"pointer",
fontSize:"16px",
fontWeight:"600"
},

footer:{
marginTop:"18px",
fontSize:"12px",
color:"#777"
}

};

export default Login;