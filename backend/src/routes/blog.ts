import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, sign, verify } from 'hono/jwt'
import {createPostInput, updatePostInput} from "@talhaansarii/blogs"


export const blogRouter = new Hono<{
    Bindings: {
      DATABASE_URL: string
      JWT_SECRET : string
    },
    Variables : {
        userId : string
    }
  }>()

  blogRouter.use("/*", async (c, next) => {
    // console.log("from middleware")
    const authHeader = c.req.header("authorization") || ""

    try {
        const user = await verify(authHeader , c.env.JWT_SECRET);
    // console.log(user)
    if(user){
        c.set("userId" , user.id)
        // console.log("from above next")
        await next();
    }else{
        c.status(403)
        return c.json({
            message : "you are not logged in"
        })
    }
        
    } catch (error) {
        c.status(403)
        return c.json({
            message : "you are not logged in"
        })
        
    }
    

  })
  

  blogRouter.post('/', async (c) => {
    const body = await c.req.json();

    const {success} = createPostInput.safeParse(body)

  if(!success){
    c.status(403)
    return c.json({message :"invalid inputs"})
  }
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const authorId = c.get("userId")

    const blog = await prisma.post.create({
        data : {
            title : body.title,
            content : body.content,
            authorId : authorId

        }
    })

    return c.json({
       id : blog.id
    })
  })


  blogRouter.put('/', async (c) => {

    const body = await c.req.json();
    const {success} = updatePostInput.safeParse(body)

  if(!success){
    c.status(403)
    return c.json({message :"invalid inputs"})
  }
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const blog = await prisma.post.update({
        where: {
            id: body.id,
          },
        data : {
            title : body.title,
            content : body.content,
            

        }
    })
    return c.json({
        id :blog.id
    })
  })


  blogRouter.get('/bulk', async (c) => {
    console.log("from bulk")
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())


    try {
        const blogs = await prisma.post.findMany()

        return c.json({blogs})
        
    } catch (error) {
        c.status(411)
        return c.json({
            message : "error while finding blogs"
        })
    }
    
    
  })


  blogRouter.get('/:id', async (c) => {
    const id = c.req.param("id")
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())


    try {
        const blog = await prisma.post.findFirst({
            where: {
                id: id,
              }  
        })

        return c.json({blog})
        
    } catch (error) {
        c.status(411)
        return c.json({
            message : "error while finding blog"
        })
    }
    
    
  })





