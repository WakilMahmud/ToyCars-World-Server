const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// console.log(process.env.DB_USER, process.env.DB_PASSWORD);
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hgdpfd2.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

async function run() {
	try {
		const toyCollection = await client.db("toys").collection("toy");

		// All Toys page. By default 20 data is sending
		app.get("/allToys", async (req, res) => {
			const result = await toyCollection.find().limit(20).toArray();
			res.send(result);
		});

		//Get the toys based on toy name
		app.get("/allToys/:search", async (req, res) => {
			const search = req.params.search;
			// console.log(search);
			const result = await toyCollection.find({ toy_name: { $regex: search, $options: "i" } }).toArray();
			res.send(result);
		});

		// Get all the my toys based on price ascending or descending order
		app.get("/toys", async (req, res) => {
			const email = req.query.email;
			const sorting = req.query.sorting;
			// console.log(email, sorting);

			const filter = { seller_email: email };

			if (sorting == "ascending") {
				obj = { price: 1 };
			} else {
				obj = { price: -1 };
			}
			const result = await toyCollection.find(filter, { sort: obj }).toArray();
			res.send(result);
		});

		// Show by category
		app.get("/shop/:category", async (req, res) => {
			const category = req.params.category;
			console.log({ category });
			const query = { sub_category: category };
			const result = await toyCollection.find(query).toArray();
			res.send(result);
		});

		//Get Single toy details
		app.get("/toy/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };

			const result = await toyCollection.findOne(query);
			res.send(result);
		});

		//Add A Toy page
		app.post("/toy", async (req, res) => {
			const data = req.body;
			const result = await toyCollection.insertOne(data);
			res.send(result);
		});

		// 10. update toy Action
		app.patch("/toy/:id", async (req, res) => {
			const id = req.params.id;
			const updatedData = req.body;

			const filter = { _id: new ObjectId(id) };
			const options = { upsert: true };

			const updateDoc = {
				$set: {
					price: updatedData.price,
					available_quantity: updatedData.available_quantity,
					detail_description: updatedData.detail_description,
				},
			};
			const result = await toyCollection.updateOne(filter, updateDoc, options);
			res.send(result);
		});

		// 10. delete toy Action
		app.delete("/toy/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const result = await toyCollection.deleteOne(query);
			res.send(result);
		});

		await client.db("admin").command({ ping: 1 });
		console.log("Pinged your deployment. You successfully connected to MongoDB!");
	} finally {
		// Ensures that the client will close when you finish/error
		// await client.close();
	}
}
run().catch(console.dir);

app.get("/", (req, res) => {
	res.send("Toy Server is running");
});

app.listen(port, () => {
	console.log("Server is running");
});
