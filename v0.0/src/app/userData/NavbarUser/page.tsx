"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function NavbarAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // ✅ Check authentication status from sessionStorage
    const userType = sessionStorage.getItem("userType");
    setIsAuthenticated(userType === "User");
  }, []);
  return (
    <nav className="bg-teal-900 flex justify-between ">
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
            <Link href="/userData/ProfileUser">Profile</Link>
          </>
        )}
      </div>
    </nav>
  );
}
