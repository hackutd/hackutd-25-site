import { RequestHelper } from '@/lib/request-helper';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useAuthContext } from '@/lib/user/AuthContext';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { GetServerSideProps } from 'next';
import { checkUserPermission } from '@/lib/util';

const allowedRoles = ['super_admin'];

const Page = () => {
  const { user, isSignedIn } = useAuthContext();
  const hasAccess = isSignedIn && checkUserPermission(user, allowedRoles);

  const [values, setValues] = React.useState({
    name: '',
    title: '',
    description: '',
    img: '',
  });
  const [form, setForm] = React.useState({
    name: values.name,
    title: values.title,
    description: values.description,
    img: values.img,
  });
  const [isEditing, setIsEditing] = React.useState(false);

  const fileInputRef = React.useRef(null);

  const handleImageClick = () => {
    if (isEditing) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setForm({ ...form, img: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async () => {
    if (!user?.token) {
      alert('You are not authorized to perform this action.');
      return;
    }
    const { data }: any = await RequestHelper.post(
      '/api/keynotespeakers',
      {
        headers: {
          Authorization: user.token,
        },
      },
      form,
    );
    if (data.msg == 'ok') {
      setValues(form);
      setIsEditing(false);
      alert('updated');
    } else {
      alert('there was an error: ' + data.msg);
    }
  };

  useEffect(() => {
    if (!hasAccess) return;

    const fetchData = async () => {
      const { data: keynote }: any = await RequestHelper.get('/api/keynotespeakers', {
        headers: {
          Authorization: user?.token ?? '',
        },
      });
      setValues(keynote);
    };
    fetchData();
  }, [hasAccess, user?.token]);

  if (!hasAccess) {
    return <div className="text-2xl font-black text-center">Unauthorized</div>;
  }

  return (
    <div className="w-full h-full flex flex-col justify-center items-center p-12 gap-4 relative">
      {/* Top-left return to event dashboard */}
      <div className="absolute top-4 left-4">
        <Link href="/admin" passHref legacyBehavior>
          <div className="cursor-pointer items-center inline-flex text-[#FFFFFF] font-bold md:text-lg text-base">
            <span style={{ fontSize: '1.5rem', marginRight: '0.25rem' }}>{'<'}</span>
            return to event dashboard
          </div>
        </Link>
      </div>
      <div className="flex h-full w-1/2 gap-2 ">
        {!isEditing && (
          <div className="w-1/3 flex justify-center items-center bg-gray-500 rounded-lg">
            {values.img == '' ? (
              <div>
                <h1 className="text-white">Currently no image</h1>
              </div>
            ) : (
              <Image
                className="rounded-lg"
                src={values.img}
                alt="Keynote"
                width={200}
                height={200}
              />
            )}
          </div>
        )}

        {isEditing && (
          <div onClick={handleImageClick} className="bg-gray-500 rounded-lg">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            ></input>

            {form.img == '' ? (
              <div className="flex justify-center items-center ">
                <h1 className="text-white">Currently no image</h1>
              </div>
            ) : (
              <Image className="rounded-lg" src={form.img} alt="Keynote" width={200} height={200} />
            )}
          </div>
        )}

        {isEditing ? (
          <div className="flex flex-col p-5 bg-gray-500 w-full rounded-lg">
            <h1 className="text-white">Name</h1>
            <input
              type="text"
              placeholder="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            ></input>

            <h1 className="text-white">Title</h1>
            <input
              type="text"
              placeholder="name"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            ></input>

            <h1 className="text-white">Description</h1>
            <textarea
              placeholder="Enter description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="p-2 border rounded"
            ></textarea>
          </div>
        ) : (
          <div className="flex flex-col p-5 bg-gray-500 w-full rounded-lg">
            <h1 className="text-white text-4xl">{values.name}</h1>
            <p className="text-white border-b-[1px] border-gray-500">{values.title}</p>
            <p className="text-white">{values.description}</p>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="flex gap-3">
          <button onClick={onSubmit} className="text-white p-2 bg-green-400 rounded-md">
            Save
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="text-white p-2 bg-red-400 rounded-md"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => {
            setIsEditing(true);
            setForm(values);
          }}
          className="text-white p-2 bg-gray-400 rounded-md"
        >
          Edit
        </button>
      )}
    </div>
  );
};

export default Page;

// Prevent static generation for admin pages
export const getServerSideProps = async () => {
  return {
    props: {},
  };
};
