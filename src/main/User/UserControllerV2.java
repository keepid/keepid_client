package User;

import Database.UserV2.UserV2Dao;
import Security.SecurityUtils;
import User.V2.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.javalin.http.Handler;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;

@Slf4j
public class UserControllerV2 {

  private UserV2Dao userDao;

  public UserControllerV2(UserV2Dao userDao) {
    this.userDao = userDao;
  }

  public Handler signup =
      ctx -> {
        BaseUser payload = ctx.bodyAsClass(BaseUser.class);
        String hash = SecurityUtils.hashPassword(payload.getPassword());
        if (hash == null) {
          log.error("Could not hash password");
          ctx.result(UserMessage.HASH_FAILURE.toResponseString());
        }
        payload.setPassword(hash);
        userDao.save(payload);
        ctx.result(UserMessage.SUCCESS.toResponseString());
      };

  public Handler addInformation =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        Mask.MaskType maskType = Mask.MaskType.valueOf(req.getString("mask"));
        ObjectMapper objectMapper = new ObjectMapper();
        switch (maskType) {
          case basicInfo:
            BasicInfo basicInfo =
                objectMapper.readValue(req.get("basicInfo").toString(), BasicInfo.class);
            userDao.update(basicInfo.toMap(), ctx.pathParam("username"));
            break;
          case demographicInfo:
            DemographicInfo demographicInfo =
                objectMapper.readValue(
                    req.get("demographicInfo").toString(), DemographicInfo.class);
            userDao.update(demographicInfo.toMap(), ctx.pathParam("username"));
            break;
          case familyInfo:
            FamilyInfo familyInfo =
                objectMapper.readValue(req.get("demographicInfo").toString(), FamilyInfo.class);
            userDao.update(familyInfo.toMap(), ctx.pathParam("username"));
            break;
          case veteranStatus:
            VeteranStatus veteranStatus =
                objectMapper.readValue(req.get("demographicInfo").toString(), VeteranStatus.class);
            userDao.update(veteranStatus.toMap(), ctx.pathParam("username"));
            break;
          default:
            ctx.result(UserMessage.SERVER_ERROR.toResponseString());
            break;
        }
      };

  static class Mask {
    public enum MaskType {
      basicInfo,
      demographicInfo,
      familyInfo,
      veteranStatus,
      UNKNOWN
    }

    public static MaskType toString(String mask) {
      try {
        return Enum.valueOf(MaskType.class, mask);
      } catch (Exception e) {
        return MaskType.UNKNOWN;
      }
    }
  }
}
