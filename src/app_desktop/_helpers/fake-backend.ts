import { Http, BaseRequestOptions, Response, ResponseOptions, RequestMethod } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';

export let fakeBackendProvider = {
    // use fake backend in place of Http service for backend-less development
    provide: Http,
    useFactory: (backend: MockBackend, options: BaseRequestOptions) => {
        // array in local storage for registered users
        let users: any[] = JSON.parse(localStorage.getItem('users')) || [];

        let testUser = {
            id: 1,
            email: 'test-email@mail.com',
            username: 'nickname',
            password: 'password',
            firstName: 'Name',
            lastName: 'Surname',
            ava_100: '/assets/images/ava.png',
            ava_160: '/assets/images/ava_160.png',
            avatar_name: 'avatar name??',
            avatar_uid: 9000,
            current_sign_in_at: 'date-00',
            current_sign_in_ip: '127.0.0.1',
            firm_id: 36,
            last_sign_in_at: 'date-03',
            last_sign_in_ip: '0.0.0.0',
            remember_created_at: 'date-35',
            reset_password_sent_at: 'date-xx',
            reset_password_token: 'reset_password_token',
            sign_in_count: 999,
            time_zone: 3,
        };

        let testUsers = [{
            id: 1,
            email: 'test-email@mail.com',
            username: 'nickname',
            password: 'password',
            firstName: 'Name',
            lastName: 'Surname',
            ava_100: '/assets/images/ava.png',
            ava_160: '/assets/images/ava_160.png',
            avatar_name: 'avatar name??',
            avatar_uid: 9000,
            current_sign_in_at: 'date-00',
            current_sign_in_ip: '127.0.0.1',
            firm_id: 36,
            last_sign_in_at: 'date-03',
            last_sign_in_ip: '0.0.0.0',
            remember_created_at: 'date-35',
            reset_password_sent_at: 'date-xx',
            reset_password_token: 'reset_password_token',
            sign_in_count: 999,
            time_zone: 3,
            role: 1,
        },{
            id: 1,
            email: 'test-email2@mail.com',
            username: 'nickname2',
            password: 'password',
            firstName: 'Name2',
            lastName: 'Surname2',
            ava_100: '/assets/images/ava.png',
            ava_160: '/assets/images/ava_160.png',
            avatar_name: 'avatar name??',
            avatar_uid: 9000,
            current_sign_in_at: 'date-00',
            current_sign_in_ip: '127.0.0.1',
            firm_id: 36,
            last_sign_in_at: 'date-03',
            last_sign_in_ip: '0.0.0.0',
            remember_created_at: 'date-35',
            reset_password_sent_at: 'date-xx',
            reset_password_token: 'reset_password_token',
            sign_in_count: 999,
            time_zone: 3,
            role: 2,
        },{
            id: 1,
            email: 'test-email3@mail.com',
            username: 'nickname3',
            password: 'password',
            firstName: 'Name3',
            lastName: 'Surname3',
            ava_100: '/assets/images/ava.png',
            ava_160: '/assets/images/ava_160.png',
            avatar_name: 'avatar name??',
            avatar_uid: 9000,
            current_sign_in_at: 'date-00',
            current_sign_in_ip: '127.0.0.1',
            firm_id: 36,
            last_sign_in_at: 'date-03',
            last_sign_in_ip: '0.0.0.0',
            remember_created_at: 'date-35',
            reset_password_sent_at: 'date-xx',
            reset_password_token: 'reset_password_token',
            sign_in_count: 999,
            time_zone: 3,
            role: 2,
        }];

        let testCompanies = [{
            firm_id: 40,
            hot: '5',
            title: 'Test1 Company Corp.',
        }];

        let testCompany = {
            firm_id: 40,
            hot: '5',
            title: 'Test1 Company Corp.',
        };

        let testEmails = [
            'justdummybox@mail.com',
        ];

        let testChangelog = [{
            title: 'What\'s new on 15 Jun 2015:',
            body: "Hi mates. Here's the cumulative update for what has been done within the last two weeks. Further we will post here daily.<div><br></div><div>-The deal name is now changeable</div><div>-Avatar of ur mates is being shown for any comment inside the deal, so it's getting more social</div><div>-All loaders are now work as it expected</div><div>-Infinite scroll everywhere it helps</div><div>-Deal can be now postponed or closed only if you're an owner of the deal</div><div>-Significantly increased (more than x10) the speed of the emailing experience, and we found the way how to increase it even more</div><div>-A fast search within emails, deals and contacts - everything is in just one field, and it's realtime</div><div>-You're now having a profile picture (it will be very useful in future, when dashboard and social metrics appear)</div><div>-User data is now may be changed</div><div>-It's now obvious how many red (overdue) deals you have in any company you're connected</div><div>-To make the deal \"white\" you must be an owner of it</div><div>-Deal's reassign is now much more useable</div><div>-The history of all the activity is collecting now at the user's page</div><div>-Scroll is now working normally, without speed problems</div><div>-Files could be attached to emails from now, and the total limit is 30mb+</div><div><br></div><div><br></div><div>+</div><div>A lot of server, design, interface and bugs fixes and improvements.&nbsp;</div><div>Stay tuned =)</div><div><br></div><div><br></div>",
        }];

        let testDeals = [{
            id: 1283,
            title: 'buy 100500 apple units',
            dayCounter: 8,
            owner: 850,
            date: '1970-01-01T00:00:00.000Z',
            timer: '1467223432',
            dayToActive: 43,
            partner_name: 'Mike Donaldson'
        },{
            id: 1384,
            title: 'buy 100501 apple units',
            dayCounter: 8,
            owner: 850,
            date: '1970-01-01T00:00:00.000Z',
            timer: '1467223432',
            dayToActive: 43,
            partner_name: 'Mike Richardson'
        },{
            id: 1570,
            title: 'buy 100502 apple units',
            dayCounter: 8,
            owner: 850,
            date: '1970-01-01T00:00:00.000Z',
            timer: '1467223432',
            dayToActive: 43,
            partner_name: 'Mike Donaldson'
        }];

        let testThreads = [{
            thread_id: 47,
            unread: true,
            from: 'emailFrom@mail.box',
            to: 'emailTo@mail.box',
            list: [{
                    rawFrom: 'emailFrom@mail.raw',
                    date: '1970-01-01T00:00:00.000Z',
                    fromContact: {
                        url: 'http://url-from',
                        name: 'Name-from',
                    },
                    from: 'name-from@url-from',
                    recepients: [{
                        contact_url: 'http://contact-url1',
                        address: 'contact address',
                        contact_name: 'Contact name',
                    },{
                        contact_url: 'http://contact-url2',
                        address: 'contact address',
                        contact_name: 'Contact name',
                    },{
                        contact_url: 'http://contact-url3',
                        address: 'contact address',
                        contact_name: 'Contact name',
                    }],
                    hasAttaches: 1,
                    attaches: [{
                        name: 'attach#1',
                        size: 12364,
                        url: 'http://attach-url',
                    },{
                        name: 'attach#2',
                        size: 12364,
                        url: 'http://attach-url',
                    },{
                        name: 'attach#3',
                        size: 12364,
                        url: 'http://attach-url',
                    },],
            },{
                rawFrom: 'emailFrom@mail.raw',
                date: '1970-01-01T00:00:00.000Z',
                fromContact: {
                    url: 'http://url-from',
                    name: 'Name-from',
                },
                from: 'name-from@url-from',
                recepients: [{
                    contact_url: 'http://contact-url',
                    address: 'contact address',
                    contact_name: 'Contact name',
                }],
                hasAttaches: 1,
                attaches: [{
                    name: 'attach#1',
                    size: 12364,
                    url: 'http://attach-url',
                }],
            },{
                rawFrom: 'emailFrom@mail.raw',
                date: '1970-01-01T00:00:00.000Z',
                fromContact: {
                    url: 'http://url-from',
                    name: 'Name-from',
                },
                from: 'name-from@url-from',
                recepients: [{
                    contact_url: 'http://contact-url',
                    address: 'contact address',
                    contact_name: 'Contact name',
                }],
                hasAttaches: 0,
                attaches: [],
            }],
            subject: 'EmailSubject',
            snippet: 'Product Version: NetBeans IDE 8.2 (Build 201609300101) Updates: NetBeans IDE is updated to version NetBeans 8.2 Patch 1 Java: 1.8.0_121; Java HotSpot(TM) 64-Bit Server VM 25.121-b13 Runtime: Java(TM) SE Runtime Environment 1.8.0_121-b13 System: Windows 10 version 10.0 running on amd64; UTF-8; en_US (nb) User directory: C:\\Users\\sol\\AppData\\Roaming\\NetBeans\\8.2 Cache directory: C:\\Users\\sol\\AppData\\Local\\NetBeans\\Cache\\8.2',
            date: '1970-01-01T00:00:00.000Z',
        },{
            thread_id: 48,
            unread: true,
            from: 'emailFrom@mail.box',
            to: 'emailTo@mail.box',
            list: [{
                12: 21,
            }],
            subject: 'EmailSubject2',
            snippet: 'Product Version: NetBeans IDE 8.2 (Build 201609300101) Updates: NetBeans IDE is updated to version NetBeans 8.2 Patch 1 Java: 1.8.0_121; Java HotSpot(TM) 64-Bit Server VM 25.121-b13 Runtime: Java(TM) SE Runtime Environment 1.8.0_121-b13 System: Windows 10 version 10.0 running on amd64; UTF-8; en_US (nb) User directory: C:\\Users\\sol\\AppData\\Roaming\\NetBeans\\8.2 Cache directory: C:\\Users\\sol\\AppData\\Local\\NetBeans\\Cache\\8.2',
            date: '1970-01-01T00:00:00.000Z',
        },{
            thread_id: 49,
            unread: true,
            from: 'emailFrom@mail.box',
            to: 'emailTo@mail.box',
            list: [{
                12: 21,
            }],
            subject: 'EmailSubject3',
            snippet: 'Product Version: NetBeans IDE 8.2 (Build 201609300101) Updates: NetBeans IDE is updated to version NetBeans 8.2 Patch 1 Java: 1.8.0_121; Java HotSpot(TM) 64-Bit Server VM 25.121-b13 Runtime: Java(TM) SE Runtime Environment 1.8.0_121-b13 System: Windows 10 version 10.0 running on amd64; UTF-8; en_US (nb) User directory: C:\\Users\\sol\\AppData\\Roaming\\NetBeans\\8.2 Cache directory: C:\\Users\\sol\\AppData\\Local\\NetBeans\\Cache\\8.2',
            date: '1970-01-01T00:00:00.000Z',
        }];

        let testStats = {
            creation_date: '1970-01-01T00:00:00.000Z',
            threads: 67467,
            linked: 380,
        }

        // configure fake backend
        backend.connections.subscribe((connection: MockConnection) => {
            // wrap in timeout to simulate server api call
            setTimeout(() => {

                // authenticate
                if (connection.request.url.endsWith('/api/authenticate') && connection.request.method === RequestMethod.Post) {
                    // get parameters from post request
                    let params = JSON.parse(connection.request.getBody());

                    // find if any user matches login credentials
                    let filteredUsers = users.filter(user => {
                        return user.username === params.username && user.password === params.password;
                    });

                    if (filteredUsers.length) {
                        // if login details are valid return 200 OK with user details and fake jwt token
                        let user = filteredUsers[0];
                        connection.mockRespond(new Response(new ResponseOptions({
                            status: 200,
                            body: {
                                id: user.id,
                                username: user.username,
                                firstName: user.firstName,
                                lastName: user.lastName,
                                token: 'fake-jwt-token'
                            }
                        })));
                    } else {
                        // else return 400 bad request
                        connection.mockError(new Error('Username or password is incorrect'));
                    }
                }

                // get users
                if (connection.request.url.endsWith('/api/users') && connection.request.method === RequestMethod.Get) {
                    connection.mockRespond(new Response(new ResponseOptions({ status: 200, body: testUsers })));
                    // check for fake auth token in header and return users if valid, this security is implemented server side in a real application
                    // if (connection.request.headers.get('Authorization') === 'Bearer fake-jwt-token') {
                    //     connection.mockRespond(new Response(new ResponseOptions({ status: 200, body: users })));
                    // } else {
                    //     // return 401 not authorised if token is null or invalid
                    //     connection.mockRespond(new Response(new ResponseOptions({ status: 401 })));
                    // }
                }

                // get user by id
                if (connection.request.url.match(/\/api\/users\/\d+$/) && connection.request.method === RequestMethod.Get) {
                    connection.mockRespond(new Response(new ResponseOptions({ status: 200, body: testUser })));
                    // check for fake auth token in header and return user if valid, this security is implemented server side in a real application
                    // if (connection.request.headers.get('Authorization') === 'Bearer fake-jwt-token') {
                    //     // find user by id in users array
                    //     let urlParts = connection.request.url.split('/');
                    //     let id = parseInt(urlParts[urlParts.length - 1]);
                    //     let matchedUsers = users.filter(user => { return user.id === id; });
                    //     let user = matchedUsers.length ? matchedUsers[0] : null;
                    //
                    //     console.log(testUser);
                    //
                    //     // respond 200 OK with user
                    //     connection.mockRespond(new Response(new ResponseOptions({ status: 200, body: testUser })));
                    // } else {
                    //     // return 401 not authorised if token is null or invalid
                    //     connection.mockRespond(new Response(new ResponseOptions({ status: 401 })));
                    // }
                }

                // create user
                if (connection.request.url.endsWith('/api/users') && connection.request.method === RequestMethod.Post) {
                    // get new user object from post body
                    let newUser = JSON.parse(connection.request.getBody());

                    // validation
                    let duplicateUser = users.filter(user => { return user.username === newUser.username; }).length;
                    if (duplicateUser) {
                        return connection.mockError(new Error('Username "' + newUser.username + '" is already taken'));
                    }

                    // save new user
                    newUser.id = users.length + 1;
                    users.push(newUser);
                    localStorage.setItem('users', JSON.stringify(users));

                    // respond 200 OK
                    connection.mockRespond(new Response(new ResponseOptions({ status: 200 })));
                }

                // delete user
                if (connection.request.url.match(/\/api\/users\/\d+$/) && connection.request.method === RequestMethod.Delete) {
                    // check for fake auth token in header and return user if valid, this security is implemented server side in a real application
                    if (connection.request.headers.get('Authorization') === 'Bearer fake-jwt-token') {
                        // find user by id in users array
                        let urlParts = connection.request.url.split('/');
                        let id = parseInt(urlParts[urlParts.length - 1]);
                        for (let i = 0; i < users.length; i++) {
                            let user = users[i];
                            if (user.id === id) {
                                // delete user
                                users.splice(i, 1);
                                localStorage.setItem('users', JSON.stringify(users));
                                break;
                            }
                        }

                        // respond 200 OK
                        connection.mockRespond(new Response(new ResponseOptions({ status: 200 })));
                    } else {
                        // return 401 not authorised if token is null or invalid
                        connection.mockRespond(new Response(new ResponseOptions({ status: 401 })));
                    }
                }

                // get company by user id
                if (connection.request.url.match(/\/api\/companies\?user_id=\d+$/) && connection.request.method === RequestMethod.Get) {
                    connection.mockRespond(new Response(new ResponseOptions({ status: 200, body: testCompanies })));

                }

                // get emails by user id
                if (connection.request.url.match(/\/api\/emails\?user_id=\d+$/) && connection.request.method === RequestMethod.Get) {
                    connection.mockRespond(new Response(new ResponseOptions({ status: 200, body: testEmails })));
                    
                }

                // get release notes
                if (connection.request.url.match(/\/api\/changelog$/) && connection.request.method === RequestMethod.Get) {
                    connection.mockRespond(new Response(new ResponseOptions({ status: 200, body: testChangelog })));

                }

                // get company by id
                if (connection.request.url.match(/\/api\/companies\/\d+$/) && connection.request.method === RequestMethod.Get) {
                    connection.mockRespond(new Response(new ResponseOptions({ status: 200, body: testCompany })));

                }

                // get all deals by user id
                if (connection.request.url.match(/\/api\/deals\?user_id=\d+$/) && connection.request.method === RequestMethod.Get) {
                    connection.mockRespond(new Response(new ResponseOptions({ status: 200, body: testDeals })));

                }

                // get email threads
                if (connection.request.url.match(/\/api\/threads$/) && connection.request.method === RequestMethod.Get) {
                    connection.mockRespond(new Response(new ResponseOptions({ status: 200, body: testThreads})));

                }

                // get threads stats
                if (connection.request.url.match(/\/api\/stats\?thread_id=\d+$/) && connection.request.method === RequestMethod.Get) {
                    connection.mockRespond(new Response(new ResponseOptions({ status: 200, body: testStats})));

                }

            }, 500);

        });

        return new Http(backend, options);
    },
    deps: [MockBackend, BaseRequestOptions]
};