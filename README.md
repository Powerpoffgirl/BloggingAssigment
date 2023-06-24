# BloggingAssigment

Don'ts
Don't send a response in HTML/XML and string
Never call database in controller….B'coz debugging becomes difficult.
Do's
 should send a JSON response (status, message, data)
API should be rate-limited - 500ms/ 2hit per sec.
MVC Model(Classes, Schema) , Views, Controller

1. Authentication(Session base auth) - Done
a. Register-Email(unique), username(unique), name, password(hashed)
b. Login-email/Username, password(Protected)
c. Logout
d. Session base Authentication

2. Create Blog -  Done
a. Only text data
b. Title(limit 100 char), textbody(limit 1000char)
c. Schema( title, textbody, creation_dateTime, user_id )

3. Home Page - Done
a. All the blogs in descending order of time. (Following Blogs)
b. Pagination of the API(limit-10)
c. Get only not deleted blogs
d. Get only blogs of following and not deleted

4. My Blogs - Done
a. My blogs in descending order of time
b. Pagination of the API(limit-10)

5. Edit Blogs
a. Edit can only be done within 30 min of creation

6. Delete Blog
a. Allow the user to delete the blog anytime

Database collection
1. User
2. Blog
3. Session
4. Access
5. Follow

Follow-up task
1. Follow : Allow the users to follow someone
2. Followers List: Pagination, descending order of time
3. Following List: Pagination, descending order of time
4. Unfollow: Delete the entry
5. Bin
Delete should not delete the item, it should move it to the bin
isDeleted: true, deletion_datetime : time of deletion
Update the read api's to check for isDeleted: true
Cron to delete the deleted tweets from Db- everyday to delete 30days old tweets.
Advanced Features:
1. Hashtags: 
Array of 30 chars string stored in blog schema -20 hashtags at max
2. Trending: Blogs on a particular hashtag being used most in last 3 hrs.
3. Laugh/Like on blogs- Tweet schema will have a laughReaction, likeReaction keys/{type:laugh/like, tweetId, userId}
4. Comments- Nested blogs
![image](https://github.com/Powerpoffgirl/BloggingAssigment/assets/80877414/0628987c-631c-44d5-abb5-ca063a2ae533)
