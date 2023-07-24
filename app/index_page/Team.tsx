import React from "react";
import Link from "next/link";

import {
  FaGithub,
  FaTwitter,
  FaLinkedinIn,
  FaFacebookF,
  FaInstagram,
} from "react-icons/fa";

const Team = () => {
  const teamData = [
    {
      id: "team_section_1",
      name: "Marta Smith",
      resp: "Frontend Developer",
      img: {
        imgPath: "https://mdbcdn.b-cdn.net/img/new/avatars/6.jpg",
        imgAlt: "Avatar alt 1",
      },
      social: {
        haveGithub: true,
        haveTwitter: true,
        haveLinkedIn: true,
        haveFacebook: false,
        haveInstagram: false,
      },
    },
    {
      id: "team_section_2",
      name: "Darren Randolph",
      resp: "Marketing expert",
      img: {
        imgPath: "https://mdbcdn.b-cdn.net/img/new/avatars/8.jpg",
        imgAlt: "Avatar alt 2",
      },
      social: {
        haveGithub: false,
        haveTwitter: true,
        haveLinkedIn: true,
        haveFacebook: true,
        haveInstagram: false,
      },
    },
    {
      id: "team_section_3",
      name: "Ayat Black",
      resp: "Web designer",
      img: {
        imgPath: "https://mdbcdn.b-cdn.net/img/new/avatars/15.jpg",
        imgAlt: "Avatar alt 3",
      },
      social: {
        haveGithub: false,
        haveTwitter: false,
        haveLinkedIn: true,
        haveFacebook: true,
        haveInstagram: true,
      },
    },
  ];

  return (
    <div id="home_team" className="container my-24 mx-auto md:px-6">
      {/* Section: Design Block */}
      <section className="mb-32 text-center">
        <h2 className="mb-32 text-3xl font-bold">
          Meet the <u className="text-primary_c-500">team</u>
        </h2>

        <div className="grid gap-x-6 md:grid-cols-3 lg:gap-x-12">
          {teamData.map((d) => (
            <div className="mb-24 md:mb-0">
              <div className="block h-full rounded-lg bg-white dark:bg-secondary_c-700 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]">
                <div className="flex justify-center">
                  <div className="flex justify-center -mt-[75px]">
                    <img
                      src={d.img.imgPath}
                      className="mx-auto rounded-full shadow-lg dark:shadow-black/20 w-[150px]"
                      alt={d.img.imgAlt}
                    />
                  </div>
                </div>
                <div className="p-6">
                  <h5 className="mb-4 text-lg font-bold text-secondary_c-900 dark:text-secondary_c-100">{d.name}</h5>
                  <p className="mb-6 text-secondary_c-700 dark:text-secondary_c-300">{d.resp}</p>
                  <ul className="mx-auto flex list-inside justify-center">
                    {/* Facebook */}
                    {d.social.haveFacebook && (
                      <Link href="#!" className="px-2">
                        <FaFacebookF className="h-4 w-4 bg-transparent text-terniary_c-700 dark:text-terniary_c-100" />
                      </Link>
                    )}

                    {/* Insta */}
                    {d.social.haveInstagram && (
                      <Link href="#!" className="px-2">
                        <FaInstagram className="h-4 w-4 bg-transparent text-terniary_c-700 dark:text-terniary_c-100" />
                      </Link>
                    )}

                    {/* GitHub */}
                    {d.social.haveGithub && (
                      <Link href="#!" className="px-2">
                        <FaGithub className="h-4 w-4 bg-transparent text-terniary_c-700 dark:text-terniary_c-100" />
                      </Link>
                    )}
                    {/* Twitter */}
                    {d.social.haveTwitter && (
                      <Link href="#!" className="px-2">
                        <FaTwitter className="h-4 w-4 bg-transparent text-terniary_c-700 dark:text-terniary_c-100" />
                      </Link>
                    )}
                    {/* Linkedin */}
                    {d.social.haveLinkedIn && (
                      <Link href="#!" className="px-2">
                        <FaLinkedinIn className="h-4 w-4 bg-transparent text-terniary_c-700 dark:text-terniary_c-100" />
                      </Link>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          ))}

        </div>
      </section>
    </div>
  );
};

export default Team;
