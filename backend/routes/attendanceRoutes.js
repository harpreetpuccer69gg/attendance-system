const express = require("express");
const router = express.Router();

const Store = require("../models/Store");
const Attendance = require("../models/Attendance");
const auth = require("../middleware/auth");


/* =========================
   PUNCH IN ROUTE
========================= */

router.post("/punchin", auth, async (req, res) => {

try {

const email = req.user.email;
const { latitude, longitude } = req.body;

/* VALIDATE GPS INPUT */

if (!latitude || !longitude) {
return res.status(400).json({
message: "Latitude and longitude are required"
});
}

/* FIND NEAREST STORE */

const nearestStore = await Store.findOne({
location: {
$near: {
$geometry: {
type: "Point",
coordinates: [longitude, latitude]
},
$maxDistance: 100
}
}
});

if (!nearestStore) {
return res.status(400).json({
message: "You are not near any store"
});
}

/* CHECK SAME STORE TODAY */

const today = new Date();
today.setHours(0,0,0,0);

const existingVisit = await Attendance.findOne({
tlEmail: email,
storeId: nearestStore._id,
checkInTime: { $gte: today }
});

if (existingVisit) {
return res.status(400).json({
message: "You already visited this store today"
});
}

/* AUTO CLOSE OLD ATTENDANCE */

await Attendance.updateMany(
{ tlEmail: email, checkOutTime: null },
{ $set: { checkOutTime: new Date() } }
);

/* VISIT COUNT */

const visitCount = await Attendance.countDocuments({
tlEmail: email
});

/* SAVE ATTENDANCE */

const attendance = new Attendance({

tlEmail: email,
storeId: nearestStore._id,
storeName: nearestStore.name,
visitNumber: visitCount + 1,

checkInTime: new Date(),

checkInLocation: {
latitude: latitude,
longitude: longitude
}

});

await attendance.save();

/* RESPONSE */

res.json({
message: "Punch In successful",
store: nearestStore.name,
visitNumber: attendance.visitNumber
});

} catch (err) {

console.error(err);

res.status(500).json({
message: "Server error"
});

}

});

/* =========================
   PUNCH OUT ROUTE
========================= */

router.post("/punchout", auth, async (req,res)=>{

try{

const email = req.user.email;
const {latitude,longitude} = req.body;

if(!latitude || !longitude){
return res.status(400).json({
message:"Latitude and longitude are required"
});
}


/* FIND OPEN ATTENDANCE */

const openAttendance = await Attendance.findOne({
tlEmail:email,
checkOutTime:null
}).sort({checkInTime:-1});


if(!openAttendance){
return res.status(400).json({
message:"No open punch-in found"
});
}


/* GET STORE */

const store = await Store.findById(openAttendance.storeId);


/* CHECK DISTANCE */

const distance = require("geolib").getDistance(
{
latitude: latitude,
longitude: longitude
},
{
latitude: store.location.coordinates[1],
longitude: store.location.coordinates[0]
}
);


if(distance > 100){
return res.status(400).json({
message:"You are too far from store to punch out",
distance:distance
});
}


/* UPDATE ATTENDANCE */

openAttendance.checkOutTime = new Date();

openAttendance.checkOutLocation = {
latitude: latitude,
longitude: longitude
};

await openAttendance.save();


res.json({
message:"Punch Out successful",
store:store.name
});

}catch(err){

console.error(err);

res.status(500).json({
message:"Server error"
});

}

});

/* =========================
   ADMIN ATTENDANCE REPORT
========================= */

router.get("/admin/report", async (req,res)=>{

try{

const records = await Attendance.find().sort({checkInTime:-1});

const report = records.map(r => {

let timeSpent = null;

if(r.checkOutTime){
timeSpent = Math.round(
(r.checkOutTime - r.checkInTime) / 60000
); // minutes
}

return {

tlEmail: r.tlEmail,
store: r.storeName,
visitNumber: r.visitNumber,
checkIn: r.checkInTime,
checkOut: r.checkOutTime,
timeSpentMinutes: timeSpent

};

});

res.json(report);

}catch(err){

console.error(err);

res.status(500).json({
message:"Server error"
});

}

});

/* =========================
   DAILY TL PERFORMANCE REPORT
========================= */

router.get("/admin/daily-report", async (req, res) => {

try {

const date = req.query.date || new Date().toISOString().split("T")[0];

const start = new Date(date);
start.setHours(0,0,0,0);

const end = new Date(date);
end.setHours(23,59,59,999);

const records = await Attendance.find({
checkInTime: { $gte: start, $lte: end }
});

const tlMap = {};

records.forEach(r => {

if(!tlMap[r.tlEmail]){
tlMap[r.tlEmail] = {
tlEmail: r.tlEmail,
totalVisits: 0,
firstPunchIn: r.checkInTime,
lastPunchOut: r.checkOutTime,
totalMinutes: 0
};
}

tlMap[r.tlEmail].totalVisits += 1;

if(r.checkOutTime){
const minutes = (r.checkOutTime - r.checkInTime) / 60000;
tlMap[r.tlEmail].totalMinutes += minutes;

if(r.checkOutTime > tlMap[r.tlEmail].lastPunchOut){
tlMap[r.tlEmail].lastPunchOut = r.checkOutTime;
}
}

});

res.json(Object.values(tlMap));

}catch(err){

console.error(err);

res.status(500).json({
message:"Server error"
});

}

});

/* =========================
   MY ATTENDANCE (TL VIEW)
========================= */

router.get("/my-attendance", auth, async (req,res)=>{

try{

const email = req.user.email;

const records = await Attendance.find({
tlEmail: email
}).sort({checkInTime:-1});

res.json(records);

}catch(err){

console.error(err);

res.status(500).json({
message:"Server error"
});

}

});


/* =========================
   EXPORT ROUTER
========================= */

module.exports = router;