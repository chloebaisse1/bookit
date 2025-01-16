/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
"use client"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import { SquareArrowDownRight, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import Wrapper from "../components/Wrapper"

const page = () => {
  const { user } = useKindeBrowserClient()
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [rooms, setRooms] = useState<any[]>([])
  const [companyName, setCompanyName] = useState("")

  const fetchCompanyId = async () => {
    if (user) {
      try {
        const response = await fetch("/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            familyName: user.family_name,
            givenName: user.given_name,
          }),
        })

        const data = await response.json()
        setCompanyId(data.companyId || null)
        setLoading(false)
      } catch (error) {
        console.error("erreur", error)
        setCompanyId(null)
      }
    }
  }

  const fetchRooms = async () => {
    if (companyId) {
      setLoading(true)
      try {
        const response = await fetch(`/api/rooms?companyId=${companyId}`)
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des salles.")
        }
        const data = await response.json()
        setRooms(data.rooms)
        setCompanyName(data.companyName)
        setLoading(false)
      } catch (error) {
        console.error(error)
      }
    }
  }

  useEffect(() => {
    const initializeData = async () => {
      await fetchCompanyId()
      await fetchRooms()
    }
    initializeData()
  }, [user])

  if (loading) {
    return (
      <Wrapper>
        <div className="w-full flex justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <div>
        <div>
          {companyId && (
            <div className="badge badge-secondary badge-outline">
              {companyName}
            </div>
          )}

          <h1 className="text-2xl mb-4">Réserver une salle</h1>

          {loading ? (
            <div className="text-center mt-32">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : !companyId ? (
            <div>Vous n'êtes pas associé à une entreprise</div>
          ) : rooms.length == 0 ? (
            <p>Votre entreprise ne possède aucunes salles</p>
          ) : (
            <ul className="grid md:grid-cols-3 gap-4">
              {rooms.length > 0 ? (
                rooms.map((room) => (
                  <li
                    key={room.id}
                    className="flex flex-col border-base-300 border p-5 rounded-2xl"
                  >
                    <Image
                      src={room.imgUrl ? room.imgUrl : "/placeholder.jpg"}
                      alt={room.id}
                      width={400}
                      height={400}
                      quality={100}
                      className="shadow-sm w-full h-48 object-cover rounded-xl"
                    ></Image>

                    <div className="mt-4">
                      <div className="flex items-center">
                        <div className="badge badge-secondary">
                          <Users className="mr-2 w-4" />
                          {room.capacity}
                        </div>
                        <h1 className="font-bold text-xl ml-2">{room.name}</h1>
                      </div>

                      <p className="text-sm my-2 text-gray-500">
                        {room.description.length > 100
                          ? `${room.description.slice(0, 100)}...`
                          : room.description}
                      </p>
                      <Link
                        className="btn btn-secondary btn-outline btn-sm mt-2"
                        href={`/reservations/${room.id}`}
                      >
                        <SquareArrowDownRight className="w-4" />
                        Réserver
                      </Link>
                    </div>
                  </li>
                ))
              ) : (
                <p>Votre Entreprise n'a aucune salle de réunion. </p>
              )}
            </ul>
          )}
        </div>
      </div>
    </Wrapper>
  )
}

export default page
