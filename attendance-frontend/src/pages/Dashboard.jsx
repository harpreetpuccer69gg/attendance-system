import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard(){

const [attendance,setAttendance] = useState([]);

useEffect(()=>{

const fetchAttendance = async()=>{

const token = localStorage.getItem("token");

const res = await api.get("/attendance/my-attendance",{
headers:{
Authorization: `Bearer ${token}`
}
});

setAttendance(res.data);

};

fetchAttendance();

},[]);

return(

<div>

<h2>My Attendance</h2>

<table border="1">

<thead>
<tr>
<th>Store</th>
<th>Visit</th>
<th>Check In</th>
<th>Check Out</th>
</tr>
</thead>

<tbody>

{attendance.map((a,i)=>(
<tr key={i}>
<td>{a.storeName}</td>
<td>{a.visitNumber}</td>
<td>{new Date(a.checkInTime).toLocaleString()}</td>
<td>{a.checkOutTime ? new Date(a.checkOutTime).toLocaleString() : "-"}</td>
</tr>
))}

</tbody>

</table>

</div>

);

}

export default Dashboard;