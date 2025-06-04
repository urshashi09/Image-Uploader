import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import { v2 as cloudinary } from 'cloudinary';
import path from 'path'
import fs from 'fs'
import dotenv from "dotenv"
dotenv.config()


await mongoose.connect(process.env.MONGO_URI).then(() => console.log("mongodb connected"))
  .catch((err) => console.log(err))

const imageSchema = new mongoose.Schema({
  filename: String,
  public_id: String,
  imgUrl: String
})
const File = mongoose.model("cloudinary", imageSchema)



// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

const app = express()
const port = process.env.PORT || 3000

app.set("view engine", "ejs");
app.get('/', (req, res) => {
  res.render('index.ejs', ({ url: null }))
})


const storage = multer.diskStorage({
  destination: './public/uploads',
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + path.extname(file.originalname)
    cb(null, file.fieldname + "-" + uniqueSuffix)
  }
})


const upload = multer({ storage: storage })

app.post('/upload', upload.single('file'), async (req, res) => {
  const filepath = req.file.path
  const cloudinaryRes = await cloudinary.uploader.upload(filepath, {
    folder: "Image Uploader Project"
  })

  fs.unlink(filepath, (err) => {
  if (err) console.error("File deletion error:", err)
});

  const db = await File.create({
    filename: req.file.originalname,
    public_id: cloudinaryRes.public_id,
    imgUrl: cloudinaryRes.secure_url
  })

  res.render("index.ejs", { url: cloudinaryRes.secure_url })


})




app.listen(port, () => console.log(`server is running on port ${port}`)
)    