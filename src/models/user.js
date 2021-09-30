import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


// MongoDB 에 ORM 하기위한 스키마 정의
const UserSchema = new Schema({
    username: String,
    hashedPassword: String,
});

// username 이라는 사용자가 MongoDB User DB 내에 있는 지 체크하는 함수 (-> ID 중복체크, 로그인 요청 시 활용)
UserSchema.statics.findByUsername = function (username) {
    return this.findOne({ username });
};

// 회원가입 양식으로 입력받은 비밀번호를 암호화해서 현재 User 인스턴스 속성 값으로 저장
UserSchema.methods.setPassword = async function(password) {
    // const hashed = await bcrypt.hash(password, 10);
    this.hashedPassword = await bcrypt.hash(password, 10);
};

// 해싱된 패스워드를 입력받은 패스워드와 비교
UserSchema.methods.checkPassword = async function(password) {
    // const validation = await bcrypt.compare(password, this.hashedPassword);
    return await bcrypt.compare(password, this.hashedPassword);
};

// 사용자 ID 와 UUID 로 서명된 JWT 생성 메서드
UserSchema.methods.generateToken = function() {
    const token = jwt.sign(
        { _id: this.id, username: this.username, },
        process.env.JWT_SECRET,
        { expiresIn: '7d', }
    );
    return token;
};

// 그냥 단순한 직렬화 메서드
UserSchema.methods.serialize = function() {
    const responseBody = this.toJSON();
    delete responseBody.hashedPassword;
    return responseBody;
};


const User = mongoose.model('User', UserSchema);
export default User;