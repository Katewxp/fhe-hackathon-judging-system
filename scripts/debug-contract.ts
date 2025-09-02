import { ethers } from "hardhat";

async function main() {
  console.log("Debugging contract step by step...");

  const contractAddress = "0x2aE943E41947954CD782698F906d95B7104562A1";
  
  try {
    // Get contract instance
    const HackathonJudging = await ethers.getContractFactory("HackathonJudging");
    const contract = HackathonJudging.attach(contractAddress);

    console.log("Contract address:", contractAddress);
    
    // Test 1: Get hackathon count
    console.log("\n1. Testing getHackathonCount...");
    const hackathonCount = await contract.getHackathonCount();
    console.log("✅ Hackathon count:", hackathonCount.toString());
    
    if (hackathonCount > 0) {
      // Test 2: Try to get raw data
      console.log("\n2. Testing raw data access...");
      try {
        // Try to access the hackathons mapping directly
        const hackathonData = await contract.hackathons(0);
        console.log("✅ Raw hackathon data:", hackathonData);
      } catch (error) {
        console.log("❌ Cannot access hackathons mapping directly:", error.message);
      }
      
      // Test 3: Try individual getters
      console.log("\n3. Testing individual getters...");
      try {
        const name = await contract.getHackathonName(0);
        console.log("✅ Hackathon name:", name);
      } catch (error) {
        console.log("❌ getHackathonName not available:", error.message);
      }
      
      // Test 4: Check if there are other getter functions
      console.log("\n4. Checking available functions...");
      const contractCode = await ethers.provider.getCode(contractAddress);
      console.log("Contract has code:", contractCode !== "0x");
      
      // Test 5: Try to get events
      console.log("\n5. Checking recent events...");
      const filter = contract.filters.HackathonCreated();
      const events = await contract.queryFilter(filter, -1000, "latest");
      console.log("✅ Found", events.length, "HackathonCreated events");
      
      if (events.length > 0) {
        for (let i = 0; i < Math.min(events.length, 3); i++) {
          const event = events[i];
          console.log(`  Event ${i}:`, {
            blockNumber: event.blockNumber,
            name: event.args?.name,
            description: event.args?.description,
            startDay: event.args?.startDay?.toString(),
            endDay: event.args?.endDay?.toString()
          });
        }
      }
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
