import express from "express";
import bodyParser from "body-parser";
import mongoose, { mongo } from "mongoose";
import has from "lodash";

const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs");

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const date = new Date();




// connect database
// mongodb+srv://admin-vikash:Verdant123@verdant.fn7rrkq.mongodb.net/todolistDB
mongoose.connect("mongodb+srv://admin-vikash:verdant@verdant.fn7rrkq.mongodb.net/?retryWrites=true&w=majority",{dbName:"todolistDB"});
// mongodb://127.0.0.1:27017/todolistDB
// Verdant123@verdant

// creating schema 
const itemSchema = mongoose.Schema({
    name:String
});

// customList schema 
const listSchema = mongoose.Schema({
    name : String,
    items : {
        type : [itemSchema],
        required : false,
    }
});



// creating collection 
const Item = mongoose.model("Item",itemSchema);

// custom List collection 
const List = mongoose.model("List",listSchema);

const item1 = new Item({name:"wakeup at 5am"});
const item2 = new Item({name:"Do outdoor excerise"});
const item3 = new Item({name:"do Pooja"});

// inserting collection 

// Item.insertMany([item1,item2,item3]);






app.get("/",(req,res)=>{
    async function listItems(){
        const items = await Item.find({});
        // item.forEach(i=>console.log(i.name));
        res.render("today",{name : "Today",today_item:items,month:months[date.getMonth()],date:date.getDate(),year:date.getFullYear()});
        // res.json({success:true})
    }
    listItems(); 
    
})

// creating custom post request 

app.get("/:customList",async(req,res)=>{
    const newList = has.capitalize(req.params.customList);
    const foundItem = await List.findOne({name:newList});
    
    if(foundItem){
        res.render("today",{name:foundItem.name,today_item:foundItem.items,month:months[date.getMonth()],date:date.getDate(),year:date.getFullYear()});
    }
    else{
        const list = new List({
            name : newList,
        });
        list.save();
        res.redirect("/" + newList);
    }

   
    
})

app.post("/",async(req,res)=>{
    let itemName = req.body.NewItem;
    let customlistname = req.body.button;
    // console.log(customlistname);
    const todayItem = new Item({
        name : itemName
    });

    if(customlistname === "Today"){
        todayItem.save();
        res.redirect("/");
    }
    else{
        const founditem = await List.findOne({name:customlistname});
        founditem.items.push(todayItem);
        founditem.save();
        res.redirect("/"+customlistname);
    }


})

app.post("/delete",async(req,res)=>{
    const deletItem = req.body.Checkbox;
    const listname = req.body.ListName;

    if(listname === "Today"){
        await Item.findByIdAndRemove(deletItem);
        res.redirect("/");
    }
    else{

        await List.findOneAndUpdate({name:listname},{$pull:{items:{_id:deletItem}}});
        // $pull is a mongodb command
        res.redirect("/"+listname);
    }
   
})


app.listen(3000,()=>{
    console.log("Server is started on port number 3000...");
})