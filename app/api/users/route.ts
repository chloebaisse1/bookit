import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
export async function POST(request: Request) {
  try {
    const { email, familyName, givenName } = await request.json()

    if (!email || !familyName || !givenName) {
      return NextResponse.json(
        { error: "Missing required fileds" },
        { status: 400 }
      )
    }
    let user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          familyName,
          givenName,
        },
      })
    } else {
      if (user.familyName == null || user.givenName == null) {
        user = await prisma.user.update({
          where: { email },
          data: {
            familyName: user.familyName ?? familyName,
            givenName: user.givenName ?? givenName,
          },
        })
      }
    }

    // Vérifier si l'utilisateur est associé a une entreprise
    const company = await prisma.company.findFirst({
      where: {
        employees: {
          some: {
            id: user.id,
          },
        },
      },
    })

    // Renvoie l'ID de l'entreprise si l'utilisateur y est associé, sinon " nope"
    if (company) {
      return NextResponse.json({ companyId: company.id })
    } else {
      return NextResponse.json({ message: "nope" })
    }
  } catch (error) {
    console.error("Erreur API User", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
