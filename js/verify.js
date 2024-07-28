
    // Import Firebase modules
  
    import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-app.js";
    import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-database.js";
    
    const firebaseConfig = {
        apiKey: "AIzaSyD1YgPZ2_yGPPu54E54DrJyBD8hN7h8J8s",
        authDomain: "isrc-2a615.firebaseapp.com",
        databaseURL: "https://isrc-2a615-default-rtdb.firebaseio.com",
        projectId: "isrc-2a615",
        storageBucket: "isrc-2a615.appspot.com",
        messagingSenderId: "538265921590",
        appId: "1:538265921590:web:86499e7bc8dc7c294cd097",
        measurementId: "G-Q2ZJNQJ1MP",
      };
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);
  
    // Verify certificate function
    window.verifyCertificate = function() {
      const authCode = document.getElementById("auth-code").value;
  
      if (!authCode) {
        alert("Auth Code is required");
        return;
      }
  
      // Query Firebase Realtime Database for the given Auth Code
      const certificatesRef = ref(database, "certificates");
      get(certificatesRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            let found = false;
            for (const key in data) {
              if (data[key].authCode === authCode) {
                const certificateUrl = data[key].certificateUrl;
                document.getElementById("result").innerHTML = `
                  <h3>Verified Auth Code: ${authCode}</h3>
                  <img src="${certificateUrl}" alt="Certificate Image" style="max-width: 100%; height: auto; border: 2px solid #ddd; border-radius: 10px; padding: 10px;">
                `;
                document.getElementById("auth-card").style.display = "none";
                document.getElementById("result").style.display = "block";
                found = true;
                break;
              }
            }
            if (!found) {
              // Show invalid certificate modal if not found
              $('#invalidCertificateModal').modal('show');
              document.getElementById("result").innerHTML = '';
            }
          } else {
            // Show invalid certificate modal if no data exists
            $('#invalidCertificateModal').modal('show');
            document.getElementById("result").innerHTML = '';
          }
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          document.getElementById("result").innerHTML = `<p>Error fetching data</p>`;
        });
    }


// create 
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const messageDiv = document.getElementById('message');
    const verificationMessage = document.getElementById('verification-message');
    const resendButton = document.getElementById('resend-button');
    const timerElement = document.getElementById('timer');
    let cooldown = 30; // 30 seconds cooldown
    let interval;

    // Add hint for password input
    passwordInput.setAttribute('placeholder', 'Password (at least 6 characters)');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // Clear previous messages
        messageDiv.textContent = '';
        messageDiv.style.color = '';

        // Email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            messageDiv.textContent = 'Invalid email address';
            messageDiv.style.color = 'red';
            return;
        }

        // Password validation
        if (password.length < 6) {
            messageDiv.textContent = 'Password must be at least 6 characters long';
            messageDiv.style.color = 'red';
            return;
        }

        try {
            const response = await fetch('https://isrc-backend.onrender.com/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                messageDiv.textContent = 'Registration successful. Please check your email for verification.';
                messageDiv.style.color = 'green';
                form.style.display = 'none';
                verificationMessage.style.display = 'block';

                // Start cooldown timer
                startCooldown();

                // Poll for email verification status
                checkEmailVerification();

            } else {
                messageDiv.textContent = data.message || 'Registration failed';
                messageDiv.style.color = 'red';
            }
        } catch (error) {
            console.error('Error:', error);
            messageDiv.textContent = 'Error: Unable to register';
            messageDiv.style.color = 'red';
        }
    });

    function startCooldown() {
        let timeLeft = cooldown;
        resendButton.disabled = true;
        interval = setInterval(() => {
            timerElement.textContent = `You can resend the email in ${timeLeft} seconds.`;
            timeLeft--;
            if (timeLeft < 0) {
                clearInterval(interval);
                resendButton.disabled = false;
                timerElement.textContent = '';
            }
        }, 1000);
    }

    resendButton.addEventListener('click', async () => {
        if (!resendButton.disabled) {
            try {
                const email = emailInput.value.trim();
                const response = await fetch('https://isrc-backend.onrender.com/resend-verification', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Verification email resent!');
                    startCooldown();
                } else {
                    alert(data.message || 'Failed to resend email');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error: Unable to resend email');
            }
        }
    });

    async function checkEmailVerification() {
        const intervalId = setInterval(async () => {
            try {
                const email = emailInput.value.trim();
                const response = await fetch('https://isrc-backend.onrender.com/check-verification', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();

                if (data.verified) {
                    clearInterval(intervalId);
                    window.location.href = 'profile.html';
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }, 5000); // Check every 5 seconds
    }
});
