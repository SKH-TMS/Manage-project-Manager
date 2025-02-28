"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NavbarUser() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("userType"); // Clear userType from storage
    router.push("/userData/LoginUser"); // Redirect to LoginUser

    try {
      const response = await fetch("../../api/auth/logout", {
        method: "GET",
      });
      const data = await response.json();
      if (!data.success) {
        console.error("Error logging out:", data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    // ✅ Check authentication status from sessionStorage
    const userType = sessionStorage.getItem("userType");
    setIsAuthenticated(userType === "User");
  }, []);

  return (
    <nav className="bg-blue-900 flex justify-between">
      <div>
        <Link href="/">Home</Link>
      </div>
      <div>
        {!isAuthenticated ? (
          <>
            <Link href="/userData/RegisterUser">Register</Link>
            <Link href="/userData/LoginUser">Login</Link>
          </>
        ) : (
          <>
            <Link href="userData/ProfileUser">Profile</Link>

            <a className="cursor-pointer" onClick={handleLogout}>
              Logout
            </a>
          </>
        )}
      </div>
    </nav>
  );
}
