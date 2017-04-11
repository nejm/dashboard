
package com.smi.service;

import com.smi.dao.StatUserDao;
import com.smi.model.Statuser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

@Service("statuserService")
public class StatUserServiceImpl implements StatUserService{

    @Autowired
    @Qualifier("statuserDao")
    StatUserDao statUserDao;
    @Override
    public void save(Statuser statuser) {
        statUserDao.save(statuser);
    }

    @Override
    public void edit(Statuser statuser) {
         statUserDao.edit(statuser);
    }
    
}
