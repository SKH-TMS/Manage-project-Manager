"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function NavbarAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // ✅ Check authentication status from sessionStorage
    const userType = sessionStorage.getItem("userType");
    setIsAuthenticated(userType === "Admin");
  }, []);
  return (
    <nav className="bg-teal-900 flex justify-between ">
      <div>
        <Link href="/">Home</Link>
      </div>
      <div>
        {!isAuthenticated ? (
          <>
            <Link href="/adminData/RegisterAdmin">Admin Register</Link>
            <Link href="/adminData/LoginAdmin">Admin Login</Link>
          </>
        ) : (
          <>
            <Link href="/adminData/ProfileAdmin">Admin Profile</Link>
          </>
        )}
      </div>
    </nav>
  );
}
