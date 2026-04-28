import db from './utils/db'
import app from './app'
 app.listen(process.env.PORT || 5000,()=>{
        console.log(`Server is running on port http://${process.env.HOSTNAME}:${process.env.PORT}`)
    })

