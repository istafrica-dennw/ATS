// Paste this in browser console to check user role and token

console.log("=== USER DEBUG INFO ===");

// 1. Check localStorage
console.log("1. LocalStorage token:", localStorage.getItem('token')?.substring(0, 50) + '...');
console.log("2. LocalStorage user:", JSON.parse(localStorage.getItem('user') || '{}'));

// 2. Make API call to check user
fetch('/api/auth/me', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(res => res.json())
.then(data => {
  console.log("3. User from API:", data);
  console.log("4. User role:", data.role);
  console.log("5. Expected role: ADMIN");
  console.log("6. Has ADMIN role?", data.role === 'ADMIN');
})
.catch(err => console.error("Error fetching user:", err));

// 3. Decode JWT token to see what's inside
try {
  const token = localStorage.getItem('token');
  if (token) {
    const parts = token.split('.');
    const payload = JSON.parse(atob(parts[1]));
    console.log("7. JWT Payload:", payload);
    console.log("8. JWT Roles claim:", payload.roles);
  }
} catch (e) {
  console.error("Error decoding JWT:", e);
}

console.log("======================");
