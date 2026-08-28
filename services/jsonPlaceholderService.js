import httpClient from "../utils/httpClient.js";
import {getOrFetch} from "../utils/cache.js"

async function getPostService(id){
    return getOrFetch(`post: ${id}`, async()=> {
        const {data} = await httpClient.get(`/posts/${id}`);

        return data;
    });
}

 //Get a page of posts, with optional filtering by userId and sorting.
 //The cache key includes every input that affects the result...so that different sorts & filter page combii never collide in our cache..
async function getPostsService({ page = 1, limit = 10, userId, sortBy, order = 'asc' } = {}) {
  const cacheKey = `posts:page=${page}:limit=${limit}:userId=${userId || 'all'}:sortBy=${sortBy || 'none'}:order=${order}`;
 
  return getOrFetch(cacheKey, async()=>{
    const params = userId? {userId} : {};    
    const { data: allPosts } = await httpClient.get('/posts');

    let results = [...allPosts];

    if(sortBy === 'title'){
        results.sort((a,b)=> a.title.localeCompare(b.title));
    }else if(sortBy === 'id'){
        results.sort((a,b)=> a.id - b.id);
    }

    if(order==='desc'){
        results.reverse();
    }

    const start = (page-1) * limit;
    const pageItems = results.slice(start, start + limit);

    return {
            items: pageItems,
            page,
            limit,
            total: results.length,
            totalPages: Math.ceil(results.length/limit),
            filters: { userId: userId || null, sortBy: sortBy || null, order },
        };
    });

}

// Creates a post via the upstream API and clears the cached posts list
// so the new post shows up on the next GET instead of a stale one...
async function createPostService({ title, body, userId }) {
  const { data } = await httpClient.post('/posts', { title, body, userId });

  invalidate(`posts:page=1:limit=10:userId=all:sortBy=none:order=asc`);
 
  return data;
}

//Aggregation of user => one call to user that pulls user data, posts, comments...everything in parallel(one call)

async function getUserSummaryService(userId){
    return getOrFetch(`user-summary: ${userId}`, async()=>{
        const [userRes, postRes] = await Promise.all([
            httpClient.get(`/users/${userId}`),
            httpClient.get(`/posts`, {params: {userId}}),
        ]);

        const user = userRes.data;
        const posts = postRes.data;

        const commentCounts = await Promise.all(
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

export  { getPostService,createPostService, getPostsService, getUserSummaryService };