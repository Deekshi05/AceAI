import { V } from "framer-motion/dist/types.d-Cjd591yU";

export const CreateNewUser=mutation({
    args:{
        name:V.string(),
        email:V.string(),
        imageUrl:V.string()
    },
    handler:async(ctx ,args)=>{
        const user=await ctx.db.query('UserTable').filter(q=>q.eq(q.field('email'),args.email)).collect();
        if(user?.length==0){
            const data={
                name:args.name,
                email:args.email,
                imageUrl:args?.imageUrl
            }
            const result=await ctx.db.insert('UserTable',{...data});
            console.log(result);
            return {
                ...data,
                result
            }
        }
        return user[0];
    }
})