import z from "zod"

export const signupInput = z.object({
    email : z.string().email(),
    password : z.string().min(6),
    name: z.string().optional()
})
export const signinInput = z.object({
    email : z.string().email(),
    password : z.string().min(6)   
})
export const createPostInput = z.object({
    title : z.string(),
    content : z.string().min(6)
})

export const updatePostInput = z.object({
    title: z.string().optional(),
    content: z.string().optional(),
});

export type SignupType = z.infer<typeof signupInput>
export type SigninType = z.infer<typeof signinInput>
export type CreatePostType = z.infer<typeof createPostInput>
export type UpdatePostType = z.infer<typeof updatePostInput>