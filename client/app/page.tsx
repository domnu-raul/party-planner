"use client"
import FormInput from './ui/FormInput';
import React, { useState } from 'react';

export default function Home() {
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [isRegister, setIsRegister] = useState(true);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const url = isRegister ? 'http://localhost:8000/auth/register' : 'http://localhost:8000/auth/login';

    const requestBody = isRegister
      ? { username, email, password }
      : { username_or_email: username, password };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Success:", data);
      } else {
        const errorData = await response.json();
        console.error("Error:", errorData);
      }
    } catch (error) {
      console.error("Network Error:", error);
    }
  };

  return (
    <>
      <div className="w-3/5 h-screen bg-red-900 flex flex-col">
        <h1 className="text-gray-50 text-5xl font-bold ml-4 mt-4">Party Planner</h1>
        <div className="relative w-1/2 aspect-square overflow-hidden rounded-lg m-auto">
          <img
            src="home_page_stock.jpg"
            alt="Stock photo of a party"
            className="object-cover h-full w-full"
          />
        </div>
      </div>

      <div className="flex flex-col justify-center items-center w-2/5 h-screen bg-stone-300">
        <h1 className="text-zinc-800 text-3xl font-bold">
          {isRegister ? 'New in town?' : 'Welcome back!'}
        </h1>

        <div className="flex flex-row justify-center text-lg w-72 rounded-full my-8">
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            className={`h-full w-1/2 text-center py-2 rounded-l-full ${!isRegister ? 'bg-neutral-50 text-neutral-900' : 'bg-neutral-300 text-neutral-500'}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            className={`h-full w-1/2 text-center py-2 rounded-r-full ${isRegister ? 'bg-neutral-50 text-neutral-900' : 'bg-neutral-300 text-neutral-500'}`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="w-96 flex flex-col gap-4">
          <FormInput
            type="text"
            name="username"
            placeholder={isRegister ? "Enter your username" : "Enter your username or email"}
            value={username}
            onChange={setUsername}
          />
          {isRegister && (
            <FormInput
              type="text"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={setEmail}
            />
          )}
          <FormInput
            type="password"
            name="password"
            placeholder="Enter your password"
            value={password}
            onChange={setPassword}
          />
          <button className="bg-neutral-900 text-zinc-50 text-lg rounded-full py-3">
            {isRegister ? 'Register' : 'Login'}
          </button>
        </form>
      </div>
    </>
  );
}

