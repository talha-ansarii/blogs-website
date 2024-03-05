import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, sign, verify } from 'hono/jwt'
import {signupInput, signinInput} from "@talhaansarii/blogs"



export const userRouter = new Hono<{
    Bindings: {
      DATABASE_URL: string
      JWT_SECRET : string
    }
  }>();

  userRouter.post('/signup',async (c) => {

    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  
  const body = await c.req.json()
  const {success} = signupInput.safeParse(body)

  if(!success){
    c.status(403)
    return c.json({message :"invalid inputs"})
  }

  try {
    const user = await prisma.user.create({
      data: {
        email : body.email,
        name : body.name,
        password : body.password
      }
    })
    // console.log("printing.............")
    // console.log(user)
    const jwt = await sign({id: user.id }, c.env.JWT_SECRET)
    // localStorage.setItem("token", jwt.toString());
    return c.json({jwt})
    
  } catch (error) {
    console.log(error)
    c.status(403)
    return c.json({ error: "error while signing up" });
  }
  
  })

  userRouter.post('/signin', async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  
  const body = await c.req.json();

  const {success} = signinInput.safeParse(body)

  if(!success){
    c.status(403)
    return c.json({message :"invalid inputs"})
  }
      const user = await prisma.user.findUnique({
          where: {
              email: body.email
          }
      });
  
    if (!user) {
          c.status(403);
          return c.json({ error: "user not found" });
      }
  
  // console.log(user)
    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
      return c.json({ jwt });
  })