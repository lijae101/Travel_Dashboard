import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { logoutUser } from "~/appwrite/auth";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { account } from "~/appwrite/client";  // import Appwrite client here

const PageLayout = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            try {
                await account.get();
                setIsLoggedIn(true);
            } catch {
                setIsLoggedIn(false);
            } finally {
                setLoading(false);
            }
        };

        checkUser();
    }, []);


    const handleLogout = async () => {
        await logoutUser();
        setIsLoggedIn(false);
        navigate("/sign-in");
    };

    const goToDashboard = () => {
        navigate("/dashboard");
    };

    const goToSignIn = () => {
        navigate("/sign-in");
    };

    if (loading) return <div>Loading...</div>; // or a spinner

    return (
        <div className="min-h-screen flex flex-col">
            {/* NAVBAR */}
            <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <img src="/assets/icons/logo.svg" alt="Logo" className="size-[30px]" />
                    <h1 className="text-dark-100 p-18-semibold">Tourvisto</h1>
                </div>

                <div className="flex items-center gap-4">
                    {isLoggedIn ? (
                        <>
                            <ButtonComponent cssClass="e-primary" onClick={goToDashboard}>
                                Dashboard
                            </ButtonComponent>
                            <button onClick={handleLogout} className="cursor-pointer">
                                <img
                                    src="/assets/icons/logout.svg"
                                    alt="Logout"
                                    className="size-6"
                                />
                            </button>
                        </>
                    ) : (
                        <ButtonComponent cssClass="e-primary" onClick={goToSignIn}>
                            Sign In
                        </ButtonComponent>
                    )}
                </div>
            </nav>

            {/* CONTENT */}
            <main className="flex-grow px-6 py-6">
                <Outlet />
            </main>
        </div>
    );
};

export default PageLayout;
