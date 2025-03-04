import { useState } from 'react';
import axios from 'axios';

function CreateUserPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSignUp = async (event: React.FormEvent) => {
      event.preventDefault();
      try {
        const response = await axios.post('http://localhost:3000/users', {
            username,
            password,
        });
        const data = response.data;
        console.log("response ok", data);
        alert(`User ${data.user.username} created an account with balance ${data.account.amount} created`);
      } catch (error) {
          console.error('Error:', error);
          alert('Wrong username or password');
      }
    };

  return (
    <div className='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
      <h1 className='mb-10 text-3xl'>Registrera dig</h1>
      <form className='space-y-6'>
        <label htmlFor="username" className='block text-sm font-medium leading-6 text-gray-900'>
          Användarnamn:
          <input 
            type="text" 
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
            />
        </label>
        <label htmlFor="passowrd" className='block text-sm font-medium leading-6 text-gray-900s'>
          Lösenord:
          <input 
            type="text" 
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
        </label>
        <button onClick={handleSignUp} className='flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'>
           Skapa användare
            </button>
      </form>
    </div>
  );
}

export default CreateUserPage;