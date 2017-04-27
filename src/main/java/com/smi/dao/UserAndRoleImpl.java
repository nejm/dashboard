/*
 * Copyright 2017 Nejm.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.smi.dao;

import com.smi.model.Role;
import com.smi.model.Users;
import com.smi.model.Usersandroles;
import java.util.ArrayList;
import java.util.List;
import org.apache.log4j.Logger;
import org.hibernate.Query;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;
import org.springframework.stereotype.Repository;

@Repository("userandrole")
public class UserAndRoleImpl implements UserAndRoleDao{

    final static Logger logger = Logger.getLogger(UserAndRoleDao.class);

    private  SessionFactory sessionFactory = null;

    public SessionFactory getSessionFactory() {
         if(sessionFactory == null)
            sessionFactory = new Configuration().configure().buildSessionFactory();
         return sessionFactory;
    }

    public void setSessionFactory(SessionFactory sessionFactory) {
        this.sessionFactory = sessionFactory;
    }

    
    @Override
    public List<Usersandroles> findByUser(long id){
        Session session = this.getSessionFactory().openSession();
        session.beginTransaction();
        Query query = session.getNamedQuery("Usersandroles.findAll");
        List<Usersandroles> l = query.list();
        session.close();
        return l;
    }
    
}
