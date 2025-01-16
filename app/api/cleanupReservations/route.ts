import prisma from "@/lib/prisma"
import dayjs from "dayjs"
import { NextResponse } from "next/server"

export async function DELETE(request: Request) {
  try {
    const now = dayjs()
    const expiredReservations = await prisma.reservation.findMany({
      where: {
        OR: [
          {
            reservationDate: {
              lt: now.format("DD/MM/YYYY"),
            },
          },
          {
            reservationDate: {
              equals: now.format("DD/MM/YYYY"),
            },
            endTime: {
              lt: now.format("HH:mm"),
            },
          },
        ],
      },
    })

    if (expiredReservations.length > 0) {
      await prisma.reservation.deleteMany({
        where: {
          id: {
            in: expiredReservations.map((reservation) => reservation.id),
          },
        },
      })
    }
    return NextResponse.json({ message: "Expired reservations cleaned up" })
  } catch (error) {
    console.error("Erreur API User", error)
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    )
  }
}
