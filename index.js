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
		// Connect the client to the server	(optional starting in v4.7)
		// await client.connect();
		// Send a ping to confirm a successful connection
		const toyCollection = await client.db("toys").collection("toy");

		// 7. All Toys page
		app.get("/toys", async (req, res) => {
			const result = await toyCollection.find().toArray();
			res.send(result);
		});

		// 10. Get all data using seller/user email
		app.get("/toys/:email", async (req, res) => {
			const email = req.params.email;
			console.log(email);
			const query = { seller_email: email };

			const result = await toyCollection.find(query).toArray();
			res.send(result);
		});

		// 5. show by category
		// app.get("/toys/:category", async (req, res) => {
		// 	const category = req.params.category;
		// 	// console.log(category);
		// 	const query = { sub_category: category };
		// 	const result = await toyCollection.find(query).toArray();
		// 	res.send(result);
		// });

		//8. Single toy details
		app.get("/toy/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };

			const result = await toyCollection.findOne(query);
			res.send(result);
		});

		//9. Add a toy page
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
