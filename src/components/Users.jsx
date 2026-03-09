import { useState } from 'react';

function User({ user }) {
  return (
    <div className="col-span-12 sm:col-span-6 md:col-span-4">
      <div className="group border shadow relative">
        <img src={user.img} alt={user.name} className="w-full" />
        <div className="w-full absolute bottom-0 bg-black/75 text-white border-t-2 border-sky-700 p-4">
          <h4 className="font-semibold">
            {user.name}
            {user.hod && (
              <span className="bg-sky-700 text-white text-sm rounded font-bold px-1 ml-2">
                HoD
              </span>
            )}
          </h4>
          <h5 className="text-sm">{user.designation}</h5>
        </div>
      </div>
    </div>
  );
}

function Users() {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Dr. Arvind Kumar',
      designation: 'Associate Professor',
      img: 'https://news.stonybrook.edu/wp-content/uploads/2023/10/Professor-Derek-Teaney-e1698068548214.jpg',
    },
    {
      id: 2,
      name: 'Mr. Mitesh Ahuja',
      designation: 'Assitant Professor',
      img: 'https://news.stonybrook.edu/wp-content/uploads/2023/10/Professor-Derek-Teaney-e1698068548214.jpg',
    },
    {
      id: 3,
      name: 'Dr. Kothen Rose',
      designation: 'Professor',
      img: 'https://news.stonybrook.edu/wp-content/uploads/2023/10/Professor-Derek-Teaney-e1698068548214.jpg',
    },
    {
      id: 4,
      name: 'Dr. D. C. Panigrahi',
      designation: 'Professor',
      img: 'https://news.stonybrook.edu/wp-content/uploads/2023/10/Professor-Derek-Teaney-e1698068548214.jpg',
      hod: true,
    },
  ]);

  return (
    <div className="container py-5">
      <div className="grid grid-cols-12 gap-4">
        {users.map((user) => (
          <User key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
}
export default Users;
