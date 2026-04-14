async function run() {
  try {
    const res = await fetch("http://localhost:3002/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({name:"Test",email:"test4@example.com",password:"Password@123",role:"mentee"})
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Body:", text);
  } catch (e) {
    console.error("Fetch failed:", e);
  }
}
run();
