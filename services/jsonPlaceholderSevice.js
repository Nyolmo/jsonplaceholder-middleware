import httpClient from "../utils/httpClient.js";
import getOrFetch from "../utils/cache.js"

async function getPost(id){
    return getOrFetch(`post: ${id}`, async()=> {
        const {data} = await httpClient.get(`/posts/${id}`);

        return data;
    });
}


async function getPosts({page=1, limit=10}={}){
    return getOrFetch(`posts: page:${page}:limit:${limit}`, async()=>{
        const { data: allPosts } = await httpClient.get('/posts');

        const start = (page-1) * limit;
        const pageItems = allPosts.slice(start, start + limit);

        return {
            items: pageItems,
            page,
            limit,
            total: allPosts.length,
            totalPages: Math.ceil(allPosts.length/limit)
        };
    });

}

//Aggregation of user => one call to user that pulls user data, posts, comments...everything in parallel(one call)

async function getUserSummary(userId){
    return getOrFetch(`user-summary: ${userId}`, async()=>{
        const [userRes, postRes] = await Promise.all([
            httpClient.get(`/users/${userId}`),
            httpClient.get(`/posts`, {params: {userId}}),
        ]);

        const user = userRes.data;
        const posts = postRes.data;

        const commentCounts = Promise.all(
            posts.map((post)=> 
                httpClient
                        .get('/comments', {params: {postId:post.id}})
                        .then((r)=> ({ postId: post.id, commentCount: r.data.length}))
        )
        );

        const countMap = Object.fromEntries(
            commentCounts.map((c)=> [c.postId, c.commentCount])
        );

        return {
            id:user.id,
            name:user.name,
            email:user.email,
            company:user.company?.name,
            postCount:posts.length,
            posts: posts.map((p)=>({
                id:p.id,
                title:p.title,
                commentCount: countMap[p.id] || 0,
            }))
        };

    }, 120);
}

export  { getPost, getPosts, getUserSummary };