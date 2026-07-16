async function test() {
  const loginRes = await fetch('http://localhost:8080/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'adhithyan2028@bca.ajce.in', password: 'password123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log("Token:", token ? "Got token" : "Failed login");
  
  if (!token) {
    console.log(loginData);
    return;
  }

  const voteRes = await fetch('http://localhost:8080/api/v1/forum/votes/POST/1', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ voteType: 'UP' })
  });
  
  const text = await voteRes.text();
  console.log("Vote response:", voteRes.status, text);
}
test();
